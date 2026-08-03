"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useBulkUpdateStatus, useBulkDeleteCustomers } from "@/hooks/use-customer-mutations";

interface BulkActionsBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export function BulkActionsBar({ selectedIds, onClear }: BulkActionsBarProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const bulkStatus = useBulkUpdateStatus();
  const bulkDelete = useBulkDeleteCustomers();

  if (selectedIds.length === 0) return null;

  function handleSetStatus(status: "active" | "inactive") {
    bulkStatus.mutate(
      { ids: selectedIds, status },
      { onSuccess: () => onClear() }
    );
  }

  function handleDelete() {
    bulkDelete.mutate(selectedIds, {
      onSuccess: () => {
        setConfirmDeleteOpen(false);
        onClear();
      },
    });
  }

  const busy = bulkStatus.isPending || bulkDelete.isPending;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-accent/10 px-4 py-2.5">
        <span className="text-sm font-medium text-foreground">
          {selectedIds.length} selected
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => handleSetStatus("active")}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Active
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => handleSetStatus("inactive")}
          >
            <XCircle className="h-3.5 w-3.5" /> Mark Inactive
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={busy}
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear} disabled={busy}>
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </div>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.length} customers?</DialogTitle>
            <DialogDescription>
              This will permanently remove the selected customers. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={bulkDelete.isPending}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={bulkDelete.isPending}>
              {bulkDelete.isPending ? "Deleting..." : "Delete All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
