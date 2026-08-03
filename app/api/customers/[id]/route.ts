import { NextRequest, NextResponse } from "next/server";
import { getCustomersCollection } from "@/lib/mongodb";
import { serializeCustomer } from "@/lib/serialize";
import { Customer, CustomerInput } from "@/types/customer";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const collection = await getCustomersCollection();
    await delay(150);
    const { id } = await params;
    const doc = await collection.findOne({ id });

    if (!doc) {
      return NextResponse.json({ message: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json(serializeCustomer(doc));
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to load customer." },
      { status: 503 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const collection = await getCustomersCollection();
    await delay(300);
    const { id } = await params;
    const existing = await collection.findOne({ id });

    if (!existing) {
      return NextResponse.json({ message: "Customer not found." }, { status: 404 });
    }

    const body = (await req.json()) as Partial<CustomerInput>;

    if (body.email) {
      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const emailTaken = await collection.findOne({
        id: { $ne: id },
        email: new RegExp(`^${escapeRegex(body.email.trim())}$`, "i"),
      });
      if (emailTaken) {
        return NextResponse.json(
          { message: "A customer with this email already exists." },
          { status: 409 }
        );
      }
    }

    const update: Partial<Customer> = {
      ...body,
      name: body.name?.trim() ?? existing.name,
      email: body.email?.trim() ?? existing.email,
    };

    await collection.updateOne({ id }, { $set: update });
    const updated = await collection.findOne({ id });

    return NextResponse.json(serializeCustomer(updated!));
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to update customer." },
      { status: 503 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const collection = await getCustomersCollection();
    await delay(250);
    const { id } = await params;
    const doc = await collection.findOne({ id });

    if (!doc) {
      return NextResponse.json({ message: "Customer not found." }, { status: 404 });
    }

    await collection.deleteOne({ id });
    return NextResponse.json(serializeCustomer(doc));
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to delete customer." },
      { status: 503 }
    );
  }
}
