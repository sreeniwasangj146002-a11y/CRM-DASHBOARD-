import { NextRequest, NextResponse } from "next/server";
import { getDealsCollection, getCustomersCollection } from "@/lib/mongodb";
import { serializeDeal } from "@/lib/serialize";
import { Deal, DealInput } from "@/types/deal";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const collection = await getDealsCollection();
    const { id } = await params;
    const doc = await collection.findOne({ id });

    if (!doc) {
      return NextResponse.json({ message: "Deal not found." }, { status: 404 });
    }
    return NextResponse.json(serializeDeal(doc));
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to load deal." },
      { status: 503 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const collection = await getDealsCollection();
    const customers = await getCustomersCollection();
    await delay(200);

    const { id } = await params;
    const existing = await collection.findOne({ id });
    if (!existing) {
      return NextResponse.json({ message: "Deal not found." }, { status: 404 });
    }

    const body = (await req.json()) as Partial<DealInput>;

    if (body.value !== undefined && (!Number.isFinite(body.value) || body.value < 0)) {
      return NextResponse.json(
        { message: "Deal value must be a positive number." },
        { status: 400 }
      );
    }

    const update: Partial<Deal> = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    if (body.customerId && body.customerId !== existing.customerId) {
      const customer = await customers.findOne({ id: body.customerId });
      if (!customer) {
        return NextResponse.json(
          { message: "Selected customer no longer exists." },
          { status: 400 }
        );
      }
      update.customerName = customer.name;
      update.company = customer.company;
    }

    await collection.updateOne({ id }, { $set: update });
    const updated = await collection.findOne({ id });

    return NextResponse.json(serializeDeal(updated!));
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to update deal." },
      { status: 503 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const collection = await getDealsCollection();
    await delay(200);
    const { id } = await params;
    const doc = await collection.findOne({ id });

    if (!doc) {
      return NextResponse.json({ message: "Deal not found." }, { status: 404 });
    }

    await collection.deleteOne({ id });
    return NextResponse.json(serializeDeal(doc));
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to delete deal." },
      { status: 503 }
    );
  }
}
