import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dealsApi, ApiError } from "@/lib/api-client";
import { DealInput } from "@/types/deal";
import { useNotifications } from "@/hooks/use-notifications";

function invalidateDeals(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["deals"] });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  const notify = useNotifications((s) => s.add);
  return useMutation({
    mutationFn: (input: DealInput) => dealsApi.createDeal(input),
    onSuccess: (deal) => {
      invalidateDeals(queryClient);
      toast.success("Deal created");
      notify({ title: "Deal created", description: deal.title, type: "success" });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to create deal");
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  const notify = useNotifications((s) => s.add);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<DealInput> }) =>
      dealsApi.updateDeal(id, input),
    onSuccess: (deal) => {
      invalidateDeals(queryClient);
      toast.success("Deal updated");
      notify({ title: "Deal updated", description: deal.title, type: "info" });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to update deal");
    },
  });
}

/** Silent variant used for drag-and-drop stage changes — no toast on success, since the
 * card moving is feedback enough; still surfaces a toast (and reverts) on failure. */
export function useMoveDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: DealInput["stage"] }) =>
      dealsApi.updateDeal(id, { stage }),
    onSuccess: () => invalidateDeals(queryClient),
    onError: (err) => {
      invalidateDeals(queryClient);
      toast.error(err instanceof ApiError ? err.message : "Failed to move deal");
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  const notify = useNotifications((s) => s.add);
  return useMutation({
    mutationFn: (id: string) => dealsApi.deleteDeal(id),
    onSuccess: (deal) => {
      invalidateDeals(queryClient);
      toast.success("Deal deleted");
      notify({ title: "Deal deleted", description: deal.title, type: "error" });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete deal");
    },
  });
}
