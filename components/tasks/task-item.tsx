"use client";

import { MoreHorizontal, Calendar, User2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Task, TaskPriority } from "@/types/task";
import { useToggleTaskStatus } from "@/hooks/use-task-mutations";
import { cn, formatDate } from "@/lib/utils";

const PRIORITY_VARIANT: Record<TaskPriority, "danger" | "warning" | "default"> = {
  high: "danger",
  medium: "warning",
  low: "default",
};

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskItem({ task, onEdit, onDelete }: TaskItemProps) {
  const toggleMutation = useToggleTaskStatus();
  const isDone = task.status === "done";
  const isOverdue = !isDone && new Date(task.dueDate) < new Date(new Date().toDateString());

  function handleToggle() {
    toggleMutation.mutate({ id: task.id, status: isDone ? "todo" : "done" });
  }

  return (
    <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-surface-2/40 transition-colors">
      <Checkbox
        checked={isDone}
        onCheckedChange={handleToggle}
        aria-label={isDone ? "Mark as not done" : "Mark as done"}
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium text-foreground",
              isDone && "line-through text-muted"
            )}
          >
            {task.title}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="shrink-0 rounded p-1 text-muted hover:bg-surface-2 hover:text-foreground"
                aria-label="Task actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-danger" onClick={() => onDelete(task)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="text-xs text-muted mt-0.5 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant={PRIORITY_VARIANT[task.priority]}>
            {task.priority[0].toUpperCase() + task.priority.slice(1)}
          </Badge>
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue ? "text-danger" : "text-muted"
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(task.dueDate)}
            {isOverdue && " · Overdue"}
          </span>
          {task.relatedCustomerName && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <User2 className="h-3 w-3" />
              {task.relatedCustomerName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
