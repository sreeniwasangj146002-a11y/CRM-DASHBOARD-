import { NextRequest, NextResponse } from "next/server";
import { getTasksCollection, getCustomersCollection } from "@/lib/mongodb";
import { serializeTask } from "@/lib/serialize";
import { Task, TaskInput } from "@/types/task";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const collection = await getTasksCollection();
    const { id } = await params;
    const doc = await collection.findOne({ id });

    if (!doc) {
      return NextResponse.json({ message: "Task not found." }, { status: 404 });
    }
    return NextResponse.json(serializeTask(doc));
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to load task." },
      { status: 503 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const collection = await getTasksCollection();
    const customers = await getCustomersCollection();
    await delay(150);

    const { id } = await params;
    const existing = await collection.findOne({ id });
    if (!existing) {
      return NextResponse.json({ message: "Task not found." }, { status: 404 });
    }

    const body = (await req.json()) as Partial<TaskInput>;

    const update: Partial<Task> = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    if (body.relatedCustomerId !== undefined) {
      if (body.relatedCustomerId) {
        const customer = await customers.findOne({ id: body.relatedCustomerId });
        if (!customer) {
          return NextResponse.json(
            { message: "Selected customer no longer exists." },
            { status: 400 }
          );
        }
        update.relatedCustomerName = customer.name;
      } else {
        update.relatedCustomerName = "";
      }
    }

    await collection.updateOne({ id }, { $set: update });
    const updated = await collection.findOne({ id });

    return NextResponse.json(serializeTask(updated!));
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to update task." },
      { status: 503 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const collection = await getTasksCollection();
    await delay(200);
    const { id } = await params;
    const doc = await collection.findOne({ id });

    if (!doc) {
      return NextResponse.json({ message: "Task not found." }, { status: 404 });
    }

    await collection.deleteOne({ id });
    return NextResponse.json(serializeTask(doc));
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to delete task." },
      { status: 503 }
    );
  }
}
