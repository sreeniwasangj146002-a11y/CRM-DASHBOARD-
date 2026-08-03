"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { dealFormSchema, DealFormValues } from "@/lib/validation";
import { Deal } from "@/types/deal";
import { DEAL_STAGES, DEAL_STAGE_LABELS } from "@/types/deal";
import { useCreateDeal, useUpdateDeal } from "@/hooks/use-deal-mutations";
import { useCustomerLookup } from "@/hooks/use-customer-lookup";

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
  defaultStage?: Deal["stage"];
}

function emptyValues(defaultStage: Deal["stage"] = "lead"): DealFormValues {
  return {
    title: "",
    customerId: "",
    value: 0,
    stage: defaultStage,
    owner: "",
    expectedCloseDate: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

export function DealFormDialog({
  open,
  onOpenChange,
  deal,
  defaultStage,
}: DealFormDialogProps) {
  const isEditing = Boolean(deal);
  const createMutation = useCreateDeal();
  const updateMutation = useUpdateDeal();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const { data: customers = [], isLoading: customersLoading } = useCustomerLookup();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: emptyValues(defaultStage),
  });

  useEffect(() => {
    if (open) {
      reset(
        deal
          ? {
              title: deal.title,
              customerId: deal.customerId,
              value: deal.value,
              stage: deal.stage,
              owner: deal.owner,
              expectedCloseDate: deal.expectedCloseDate.slice(0, 10),
              notes: deal.notes,
            }
          : emptyValues(defaultStage)
      );
    }
  }, [open, deal, defaultStage, reset]);

  const onSubmit = (values: DealFormValues) => {
    const payload = {
      ...values,
      expectedCloseDate: new Date(values.expectedCloseDate).toISOString(),
    };

    if (isEditing && deal) {
      updateMutation.mutate(
        { id: deal.id, input: payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Deal" : "Add Deal"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this deal's details."
              : "Enter the details for the new deal."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Deal Title <span className="text-danger">*</span>
            </Label>
            <Input id="title" placeholder="Annual plan renewal" {...register("title")} />
            {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>
              Customer <span className="text-danger">*</span>
            </Label>
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={customersLoading ? "Loading customers…" : "Select a customer"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length === 0 && !customersLoading && (
                      <div className="px-2 py-1.5 text-sm text-muted">
                        No customers yet — add one in Contacts first.
                      </div>
                    )}
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.company ? `· ${c.company}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.customerId && (
              <p className="text-xs text-danger">{errors.customerId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="value">
                Deal Value ($) <span className="text-danger">*</span>
              </Label>
              <Input id="value" type="number" min="0" step="1" {...register("value", { valueAsNumber: true })} />
              {errors.value && <p className="text-xs text-danger">{errors.value.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Controller
                control={control}
                name="stage"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEAL_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {DEAL_STAGE_LABELS[stage]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="owner">Owner</Label>
              <Input id="owner" placeholder="Alex R." {...register("owner")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expectedCloseDate">Expected Close</Label>
              <Input id="expectedCloseDate" type="date" {...register("expectedCloseDate")} />
              {errors.expectedCloseDate && (
                <p className="text-xs text-danger">{errors.expectedCloseDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Deal context, blockers, next steps…" rows={3} {...register("notes")} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
