import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { CustomerListParams } from "@/types/customer";

export const customersQueryKey = (params: CustomerListParams) => [
  "customers",
  params,
];

/**
 * Fetches the customer list for the given filter/sort/pagination state.
 * `keepPreviousData` avoids layout flicker while a new page/filter loads.
 */
export function useCustomers(params: CustomerListParams) {
  return useQuery({
    queryKey: customersQueryKey(params),
    queryFn: () => api.listCustomers(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
