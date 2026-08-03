import { NextRequest, NextResponse } from "next/server";
import { Filter, Sort } from "mongodb";
import { getCustomersCollection } from "@/lib/mongodb";
import { serializeCustomer } from "@/lib/serialize";
import { Customer, CustomerDoc, CustomerInput } from "@/types/customer";

// Small artificial latency so loading states are actually visible on a fast
// local Mongo instance — mirrors real-world network latency.
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export async function GET(req: NextRequest) {
  try {
    const collection = await getCustomersCollection();
    await delay(200);

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") ?? "").trim();
    const statusParams = searchParams.getAll("status");
    const companyParams = searchParams.getAll("company");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const phone = (searchParams.get("phone") ?? "").trim();
    const email = (searchParams.get("email") ?? "").trim();
    const sortField = searchParams.get("sortField") ?? "lastContactDate";
    const sortDirection = searchParams.get("sortDirection") ?? "desc";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.max(1, Number(searchParams.get("pageSize") ?? "10"));

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter: Filter<CustomerDoc> = {};
    const and: Filter<CustomerDoc>[] = [];

    if (search) {
      const re = new RegExp(escapeRegex(search), "i");
      and.push({ $or: [{ name: re }, { email: re }, { company: re }] });
    }
    if (statusParams.length > 0) {
      and.push({ status: { $in: statusParams as CustomerDoc["status"][] } });
    }
    if (companyParams.length > 0) {
      and.push({ company: { $in: companyParams } });
    }
    if (dateFrom) {
      and.push({ lastContactDate: { $gte: new Date(dateFrom).toISOString() } });
    }
    if (dateTo) {
      and.push({ lastContactDate: { $lte: new Date(dateTo).toISOString() } });
    }
    if (phone) {
      and.push({ phone: new RegExp(escapeRegex(phone), "i") });
    }
    if (email) {
      and.push({ email: new RegExp(escapeRegex(email), "i") });
    }
    if (and.length > 0) filter.$and = and;

    const sort: Sort = { [sortField]: sortDirection === "asc" ? 1 : -1 };

    const total = await collection.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;

    const docs = await collection
      .find(filter)
      .sort(sort)
      .skip(start)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({
      data: docs.map(serializeCustomer),
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to load customers." },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const collection = await getCustomersCollection();
    await delay(250);

    const body = (await req.json()) as CustomerInput;

    if (!body.name?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { message: "Name and email are required." },
        { status: 400 }
      );
    }

    const existing = await collection.findOne({
      email: new RegExp(`^${body.email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });
    if (existing) {
      return NextResponse.json(
        { message: "A customer with this email already exists." },
        { status: 409 }
      );
    }

    const newCustomer: Customer = {
      id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() ?? "",
      company: body.company?.trim() ?? "",
      status: body.status ?? "active",
      lastContactDate: body.lastContactDate || new Date().toISOString(),
      notes: body.notes ?? "",
      createdAt: new Date().toISOString(),
      photoUrl: body.photoUrl ?? "",
    };

    await collection.insertOne(newCustomer);

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to create customer." },
      { status: 503 }
    );
  }
}
