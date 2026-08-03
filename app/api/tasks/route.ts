import { NextRequest, NextResponse } from "next/server";
import { Filter } from "mongodb";
import { getTasksCollection, getCustomersCollection } from "@/lib/mongodb";
import { serializeTask } from "@/lib/serialize";
import { Task, TaskDoc, TaskInput, TaskStatus } from "@/types/task";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest) {
  try {
    const collection = await getTasksCollection();
    await delay(150);

    const { searchParams } = new URL(req.url);
    const statusParams = searchParams.getAll("status");
    const search = (searchParams.get("search") ?? "").trim();

    const filter: Filter<TaskDoc> = {};
    const and: Filter<TaskDoc>[] = [];

    if (statusParams.length > 0) {
      and.push({ status: { $in: statusParams as TaskStatus[] } });
    }
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      and.push({ $or: [{ title: re }, { description: re }, { relatedCustomerName: re }] });
    }
    if (and.length > 0) filter.$and = and;

    const docs = await collection.find(filter).sort({ dueDate: 1 }).toArray();

    return NextResponse.json({ data: docs.map(serializeTask) });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to load tasks." },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const collection = await getTasksCollection();
    const customers = await getCustomersCollection();
    await delay(250);

    const body = (await req.json()) as TaskInput;

    if (!body.title?.trim()) {
      return NextResponse.json({ message: "Task title is required." }, { status: 400 });
    }
    if (!body.dueDate) {
      return NextResponse.json({ message: "Due date is required." }, { status: 400 });
    }

    let relatedCustomerName = "";
    if (body.relatedCustomerId) {
      const customer = await customers.findOne({ id: body.relatedCustomerId });
      if (!customer) {
        return NextResponse.json(
          { message: "Selected customer no longer exists." },
          { status: 400 }
        );
      }
      relatedCustomerName = customer.name;
    }

    const now = new Date().toISOString();
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: body.title.trim(),
      description: body.description?.trim() ?? "",
      dueDate: body.dueDate,
      priority: body.priority ?? "medium",
      status: body.status ?? "todo",
      relatedCustomerId: body.relatedCustomerId || null,
      relatedCustomerName,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(newTask);

    return NextResponse.json(newTask, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to create task." },
      { status: 503 }
    );
  }
}
