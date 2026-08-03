import { useQuery } from "@tanstack/react-query";

export function useCompanies() {
  return useQuery({
    queryKey: ["customers", "companies"],
    queryFn: async (): Promise<string[]> => {
      const res = await fetch("/api/customers/companies");
      if (!res.ok) throw new Error("Failed to load companies");
      return res.json();
    },
    staleTime: 60_000,
  });
}
