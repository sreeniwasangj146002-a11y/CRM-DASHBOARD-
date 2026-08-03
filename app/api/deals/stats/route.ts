import { NextResponse } from "next/server";
import { getDealsCollection } from "@/lib/mongodb";
import { DEAL_STAGES, DealStage } from "@/types/deal";

export async function GET() {
  try {
    const collection = await getDealsCollection();

    const agg = await collection
      .aggregate<{ _id: DealStage; count: number; value: number }>([
        { $group: { _id: "$stage", count: { $sum: 1 }, value: { $sum: "$value" } } },
      ])
      .toArray();

    const byStage: Record<DealStage, { count: number; value: number }> = {
      lead: { count: 0, value: 0 },
      qualified: { count: 0, value: 0 },
      proposal: { count: 0, value: 0 },
      negotiation: { count: 0, value: 0 },
      won: { count: 0, value: 0 },
      lost: { count: 0, value: 0 },
    };
    for (const row of agg) {
      if (DEAL_STAGES.includes(row._id)) byStage[row._id] = { count: row.count, value: row.value };
    }

    const openStages: DealStage[] = ["lead", "qualified", "proposal", "negotiation"];
    const openValue = openStages.reduce((sum, s) => sum + byStage[s].value, 0);
    const openCount = openStages.reduce((sum, s) => sum + byStage[s].count, 0);
    const total = agg.reduce((sum, r) => sum + r.count, 0);

    return NextResponse.json({
      total,
      openCount,
      openValue,
      wonValue: byStage.won.value,
      byStage,
    });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message ?? "Failed to load deal stats." },
      { status: 503 }
    );
  }
}
