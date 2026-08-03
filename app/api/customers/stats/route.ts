import { NextResponse } from "next/server";
import { getCustomersCollection } from "@/lib/mongodb";

export async function GET() {
  try {
    const collection = await getCustomersCollection();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [total, active, inactive, contactedThisWeek, contactedRecently, companies, allForGrowth] =
      await Promise.all([
        collection.countDocuments({}),
        collection.countDocuments({ status: "active" }),
        collection.countDocuments({ status: "inactive" }),
        collection.countDocuments({ lastContactDate: { $gte: sevenDaysAgo } }),
        collection.countDocuments({ lastContactDate: { $gte: thirtyDaysAgo } }),
        collection.distinct("company"),
        collection
          .find({}, { projection: { createdAt: 1, status: 1 } })
          .toArray(),
      ]);

    // Build a real (not mocked) 14-day new-customer growth series from createdAt.
    const days: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      d.setUTCDate(d.getUTCDate() - i);
      const dayStart = d.toISOString().slice(0, 10);
      const count = allForGrowth.filter(
        (c) => typeof c.createdAt === "string" && c.createdAt.slice(0, 10) === dayStart
      ).length;
      days.push({ date: dayStart, count });
    }

    return NextResponse.json({
      total,
      active,
      inactive,
      contactedThisWeek,
      contactedRecently,
      companyCount: companies.filter(Boolean).length,
      growth: days,
    });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to load stats." },
      { status: 503 }
    );
  }
}
