import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api-client";
import { CustomerInput, CustomerStatus } from "@/types/customer";
import { useNotifications } from "@/hooks/use-notifications";

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const notify = useNotifications((s) => s.add);
  return useMutation({
    mutationFn: (input: CustomerInput) => api.createCustomer(input),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer added");
      notify({ title: "Customer added", description: customer.name, type: "success" });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to add customer");
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const notify = useNotifications((s) => s.add);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CustomerInput> }) =>
      api.updateCustomer(id, input),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated");
      notify({ title: "Customer updated", description: customer.name, type: "info" });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to update customer");
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const notify = useNotifications((s) => s.add);
  return useMutation({
    mutationFn: (id: string) => api.deleteCustomer(id),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted");
      notify({ title: "Customer deleted", description: customer.name, type: "error" });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete customer");
    },
  });
}

/** Bulk-updates status for many customers at once (used by the bulk-edit toolbar). */
export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();
  const notify = useNotifications((s) => s.add);
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: CustomerStatus }) => {
      await Promise.all(ids.map((id) => api.updateCustomer(id, { status })));
      return ids.length;
    },
    onSuccess: (count, vars) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(`${count} customer${count === 1 ? "" : "s"} updated to ${vars.status}`);
      notify({
        title: "Bulk status update",
        description: `${count} customer${count === 1 ? "" : "s"} set to ${vars.status}`,
        type: "info",
      });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Bulk update failed");
    },
  });
}

/** Bulk-deletes many customers at once (used by the bulk-edit toolbar). */
export function useBulkDeleteCustomers() {
  const queryClient = useQueryClient();
  const notify = useNotifications((s) => s.add);
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => api.deleteCustomer(id)));
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(`${count} customer${count === 1 ? "" : "s"} deleted`);
      notify({
        title: "Bulk delete",
        description: `${count} customer${count === 1 ? "" : "s"} removed`,
        type: "error",
      });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Bulk delete failed");
    },
  });
}

/** Bulk-creates customers from an imported spreadsheet. */
export function useBulkImportCustomers() {
  const queryClient = useQueryClient();
  const notify = useNotifications((s) => s.add);
  return useMutation({
    mutationFn: async (rows: CustomerInput[]) => {
      let created = 0;
      let failed = 0;
      for (const row of rows) {
        try {
          await api.createCustomer(row);
          created++;
        } catch {
          failed++;
        }
      }
      return { created, failed };
    },
    onSuccess: ({ created, failed }) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (created > 0) {
        toast.success(
          `Imported ${created} customer${created === 1 ? "" : "s"}${failed ? `, ${failed} failed` : ""}`
        );
        notify({
          title: "Customers imported",
          description: `${created} imported${failed ? `, ${failed} failed` : ""}`,
          type: "success",
        });
      } else {
        toast.error("No valid rows found to import");
      }
    },
    onError: () => {
      toast.error("Import failed");
    },
  });
}
