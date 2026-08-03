"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Camera, X } from "lucide-react";
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
import { customerFormSchema, CustomerFormValues } from "@/lib/validation";
import { Customer } from "@/types/customer";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customer-mutations";
import { CustomerAvatar } from "@/components/customers/customer-avatar";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

const emptyValues: CustomerFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "active",
  lastContactDate: new Date().toISOString().slice(0, 10),
  notes: "",
  photoUrl: "",
};

const MAX_PHOTO_BYTES = 1_500_000; // ~1.5MB, keeps documents small

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
}: CustomerFormDialogProps) {
  const isEditing = Boolean(customer);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: emptyValues,
  });

  const photoUrl = watch("photoUrl");
  const nameValue = watch("name");

  // Re-hydrate the form whenever the dialog opens for a new customer/edit target.
  useEffect(() => {
    if (open) {
      setPhotoError(null);
      reset(
        customer
          ? {
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              company: customer.company,
              status: customer.status,
              lastContactDate: customer.lastContactDate.slice(0, 10),
              notes: customer.notes,
              photoUrl: customer.photoUrl ?? "",
            }
          : emptyValues
      );
    }
  }, [open, customer, reset]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Image is too large (max ~1.5MB).");
      return;
    }
    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => setValue("photoUrl", String(reader.result ?? ""), { shouldDirty: true });
    reader.readAsDataURL(file);
  }

  const onSubmit = (values: CustomerFormValues) => {
    const payload = {
      ...values,
      photoUrl: values.photoUrl ?? "",
      lastContactDate: new Date(values.lastContactDate).toISOString(),
    };

    if (isEditing && customer) {
      updateMutation.mutate(
        { id: customer.id, input: payload },
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
          <DialogTitle>{isEditing ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this customer's information."
              : "Enter the details for the new customer."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <CustomerAvatar name={nameValue || "?"} photoUrl={photoUrl || undefined} size="lg" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile photo"
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-2"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoUrl ? "Change photo" : "Upload photo"}
                </Button>
                {photoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue("photoUrl", "", { shouldDirty: true })}
                  >
                    <X className="h-3.5 w-3.5" /> Remove
                  </Button>
                )}
              </div>
              {photoError ? (
                <p className="text-xs text-danger">{photoError}</p>
              ) : (
                <p className="text-xs text-muted">Profile photo (optional), max ~1.5MB.</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">
              Name <span className="text-danger">*</span>
            </Label>
            <Input id="name" placeholder="Jane Cooper" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email <span className="text-danger">*</span>
            </Label>
            <Input id="email" placeholder="jane@company.com" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 (555) 123-4567" {...register("phone")} />
              {errors.phone && (
                <p className="text-xs text-danger">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Acme Corp" {...register("company")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastContactDate">Last Contact Date</Label>
              <Input
                id="lastContactDate"
                type="date"
                {...register("lastContactDate")}
              />
              {errors.lastContactDate && (
                <p className="text-xs text-danger">
                  {errors.lastContactDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Meeting notes and follow-up items..."
              rows={3}
              {...register("notes")}
            />
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
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
