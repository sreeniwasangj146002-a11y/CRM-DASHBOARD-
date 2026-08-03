"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Deal } from "@/types/deal";
import { useDeleteDeal } from "@/hooks/use-deal-mutations";

interface DeleteDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | null;
}

export function DeleteDealDialog({ open, onOpenChange, deal }: DeleteDealDialogProps) {
  const deleteMutation = useDeleteDeal();

  const handleDelete = () => {
    if (!deal) return;
    deleteMutation.mutate(deal.id, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete deal?</DialogTitle>
          <DialogDescription>
            This will permanently remove{" "}
            <span className="text-foreground font-medium">{deal?.title}</span> from the
            pipeline. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
