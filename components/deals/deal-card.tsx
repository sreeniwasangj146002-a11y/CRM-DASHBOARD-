"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Calendar, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Deal } from "@/types/deal";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface DealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
}

export function DealCard({ deal, onEdit, onDelete }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { deal },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-md border border-border bg-surface p-3 shadow-sm touch-none",
        isDragging && "opacity-50 z-10"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          {...listeners}
          {...attributes}
          className="flex-1 text-left cursor-grab active:cursor-grabbing"
          aria-label={`Drag ${deal.title}`}
        >
          <p className="text-sm font-medium text-foreground leading-snug">{deal.title}</p>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="shrink-0 rounded p-1 text-muted opacity-0 group-hover:opacity-100 hover:bg-surface-2 hover:text-foreground transition-opacity"
              aria-label="Deal actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(deal)}>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-danger" onClick={() => onDelete(deal)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-xs text-muted mt-0.5 truncate">{deal.company || deal.customerName}</p>
      <p className="text-sm font-semibold text-accent mt-2">{formatCurrency(deal.value)}</p>

      <div className="flex items-center justify-between mt-2.5 text-xs text-muted">
        <span className="flex items-center gap-1 truncate">
          <User className="h-3 w-3 shrink-0" />
          {deal.owner || "Unassigned"}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <Calendar className="h-3 w-3" />
          {formatDate(deal.expectedCloseDate)}
        </span>
      </div>
    </div>
  );
}
