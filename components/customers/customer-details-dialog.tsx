"use client";

import { Mail, Phone, Building2, Calendar, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/types/customer";
import { formatDate } from "@/lib/utils";
import { CustomerAvatar } from "@/components/customers/customer-avatar";

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerDetailsDialog({
  open,
  onOpenChange,
  customer,
  onEdit,
  onDelete,
}: CustomerDetailsDialogProps) {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Customer details</DialogTitle>
        </DialogHeader>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CustomerAvatar name={customer.name} photoUrl={customer.photoUrl} size="lg" />
            <div>
              <p className="font-semibold text-foreground">{customer.name}</p>
              <p className="text-sm text-muted">{customer.company || "—"}</p>
            </div>
          </div>
          <Badge variant={customer.status === "active" ? "active" : "inactive"}>
            {customer.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="mt-6 space-y-3 rounded-md border border-border-subtle bg-surface-2 p-4 text-sm">
          <div className="flex items-center gap-2 text-foreground/90">
            <Mail className="h-4 w-4 text-muted shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/90">
            <Phone className="h-4 w-4 text-muted shrink-0" />
            <span>{customer.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/90">
            <Building2 className="h-4 w-4 text-muted shrink-0" />
            <span>{customer.company || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/90">
            <Calendar className="h-4 w-4 text-muted shrink-0" />
            <span>Last contact {formatDate(customer.lastContactDate)}</span>
          </div>
        </div>

        {customer.notes && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
              Notes
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {customer.notes}
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onEdit(customer)}
          >
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onDelete(customer)}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
