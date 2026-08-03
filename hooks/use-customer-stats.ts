import { useQuery } from "@tanstack/react-query";

export interface StatsResponse {
  total: number;
  active: number;
  inactive: number;
  contactedThisWeek: number;
  contactedRecently: number;
  companyCount: number;
  growth: { date: string; count: number }[];
}

export function useCustomerStats() {
  return useQuery({
    queryKey: ["customers", "stats"],
    queryFn: async (): Promise<StatsResponse> => {
      const res = await fetch("/api/customers/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
    staleTime: 15_000,
    refetchInterval: 15_000, // keeps the dashboard chart feeling live
  });
}
