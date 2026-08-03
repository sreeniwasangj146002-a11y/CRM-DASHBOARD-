import { NextRequest, NextResponse } from "next/server";
import { Filter } from "mongodb";
import { getDealsCollection, getCustomersCollection } from "@/lib/mongodb";
import { serializeDeal } from "@/lib/serialize";
import { Deal, DealDoc, DealInput, DealStage } from "@/types/deal";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest) {
  try {
    const collection = await getDealsCollection();
    await delay(150);

    const { searchParams } = new URL(req.url);
    const stageParams = searchParams.getAll("stage");
    const search = (searchParams.get("search") ?? "").trim();

    const filter: Filter<DealDoc> = {};
    const and: Filter<DealDoc>[] = [];

    if (stageParams.length > 0) {
      and.push({ stage: { $in: stageParams as DealStage[] } });
    }
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      and.push({ $or: [{ title: re }, { customerName: re }, { company: re }] });
    }
    if (and.length > 0) filter.$and = and;

    const docs = await collection.find(filter).sort({ updatedAt: -1 }).toArray();

    return NextResponse.json({ data: docs.map(serializeDeal) });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to load deals." },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const collection = await getDealsCollection();
    const customers = await getCustomersCollection();
    await delay(250);

    const body = (await req.json()) as DealInput;

    if (!body.title?.trim() || !body.customerId) {
      return NextResponse.json(
        { message: "Deal title and customer are required." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(body.value) || body.value < 0) {
      return NextResponse.json(
        { message: "Deal value must be a positive number." },
        { status: 400 }
      );
    }

    const customer = await customers.findOne({ id: body.customerId });
    if (!customer) {
      return NextResponse.json(
        { message: "Selected customer no longer exists." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newDeal: Deal = {
      id: `deal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: body.title.trim(),
      customerId: customer.id,
      customerName: customer.name,
      company: customer.company,
      value: body.value,
      stage: body.stage ?? "lead",
      owner: body.owner?.trim() || "Alex R.",
      expectedCloseDate: body.expectedCloseDate || now,
      notes: body.notes ?? "",
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(newDeal);

    return NextResponse.json(newDeal, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to create deal." },
      { status: 503 }
    );
  }
}
