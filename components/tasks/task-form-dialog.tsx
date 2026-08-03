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
import { taskFormSchema, TaskFormValues } from "@/lib/validation";
import { Task, TASK_STATUSES, TASK_STATUS_LABELS } from "@/types/task";
import { useCreateTask, useUpdateTask } from "@/hooks/use-task-mutations";
import { useCustomerLookup } from "@/hooks/use-customer-lookup";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

const NO_CUSTOMER = "__none__";

const emptyValues: TaskFormValues = {
  title: "",
  description: "",
  dueDate: new Date().toISOString().slice(0, 10),
  priority: "medium",
  status: "todo",
  relatedCustomerId: null,
};

export function TaskFormDialog({ open, onOpenChange, task }: TaskFormDialogProps) {
  const isEditing = Boolean(task);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const { data: customers = [] } = useCustomerLookup();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        task
          ? {
              title: task.title,
              description: task.description,
              dueDate: task.dueDate.slice(0, 10),
              priority: task.priority,
              status: task.status,
              relatedCustomerId: task.relatedCustomerId,
            }
          : emptyValues
      );
    }
  }, [open, task, reset]);

  const onSubmit = (values: TaskFormValues) => {
    const payload = {
      ...values,
      dueDate: new Date(values.dueDate).toISOString(),
    };

    if (isEditing && task) {
      updateMutation.mutate(
        { id: task.id, input: payload },
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
          <DialogTitle>{isEditing ? "Edit Task" : "Add Task"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update this task." : "Enter the details for the new task."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Title <span className="text-danger">*</span>
            </Label>
            <Input id="title" placeholder="Follow up on proposal" {...register("title")} />
            {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Any extra detail…"
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">
                Due Date <span className="text-danger">*</span>
              </Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-xs text-danger">{errors.dueDate.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
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
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {TASK_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Related Customer</Label>
              <Controller
                control={control}
                name="relatedCustomerId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NO_CUSTOMER}
                    onValueChange={(v) => field.onChange(v === NO_CUSTOMER ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CUSTOMER}>None</SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
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
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
