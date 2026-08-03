import { NextResponse } from "next/server";
import { getCustomersCollection } from "@/lib/mongodb";

export async function GET() {
  try {
    const collection = await getCustomersCollection();
    const companies = (await collection.distinct("company"))
      .filter((c): c is string => Boolean(c && c.trim()))
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json(companies);
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to load companies." },
      { status: 503 }
    );
  }
}
