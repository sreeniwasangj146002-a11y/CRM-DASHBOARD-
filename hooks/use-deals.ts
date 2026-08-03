import { useQuery } from "@tanstack/react-query";
import { dealsApi } from "@/lib/api-client";
import { DealStage } from "@/types/deal";

export function useDeals(params: { stage?: DealStage[]; search?: string } = {}) {
  return useQuery({
    queryKey: ["deals", params],
    queryFn: () => dealsApi.listDeals(params),
    staleTime: 15_000,
  });
}

export interface DealStatsResponse {
  total: number;
  openCount: number;
  openValue: number;
  wonValue: number;
  byStage: Record<DealStage, { count: number; value: number }>;
}

export function useDealStats() {
  return useQuery({
    queryKey: ["deals", "stats"],
    queryFn: async (): Promise<DealStatsResponse> => {
      const res = await fetch("/api/deals/stats");
      if (!res.ok) throw new Error("Failed to load deal stats");
      return res.json();
    },
    staleTime: 15_000,
  });
}
