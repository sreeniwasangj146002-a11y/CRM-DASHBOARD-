import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useCustomerLookup() {
  return useQuery({
    queryKey: ["customers", "lookup"],
    queryFn: () => api.listCustomersForLookup(),
    staleTime: 30_000,
  });
}
