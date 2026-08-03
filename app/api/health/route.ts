import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
  const dbName = process.env.MONGODB_DB ?? "greentiq_crm";

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json({ ok: true, database: dbName, host: uri });
  } catch (err) {
    return NextResponse.json(
      { ok: false, database: dbName, host: uri, error: (err as Error).message },
      { status: 503 }
    );
  }
}
