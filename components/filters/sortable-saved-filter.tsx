"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star, X } from "lucide-react";
import { SavedFilter } from "@/types/customer";
import { cn } from "@/lib/utils";

interface SortableSavedFilterProps {
  filter: SavedFilter;
  isActive: boolean;
  onApply: () => void;
  onRemove: () => void;
}

export function SortableSavedFilter({
  filter,
  isActive,
  onApply,
  onRemove,
}: SortableSavedFilterProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: filter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-sm transition-colors",
        isActive
          ? "border-accent/40 bg-accent/10 text-accent"
          : "border-border-subtle bg-surface-2 text-foreground/85 hover:border-border"
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-2 hover:text-muted touch-none"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button onClick={onApply} className="flex-1 text-left flex items-center gap-1.5">
        {filter.isTemplate && <Star className="h-3 w-3 shrink-0" />}
        <span className="truncate">{filter.name}</span>
      </button>
      {!filter.isTemplate && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 text-muted-2 hover:text-danger transition-opacity"
          aria-label="Remove saved filter"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
