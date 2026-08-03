"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { DealCard } from "@/components/deals/deal-card";
import { Deal, DealStage, DEAL_STAGE_LABELS } from "@/types/deal";
import { cn, formatCurrency } from "@/lib/utils";

interface DealColumnProps {
  stage: DealStage;
  deals: Deal[];
  onAdd: (stage: DealStage) => void;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
}

export function DealColumn({ stage, deals, onAdd, onEdit, onDelete }: DealColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, data: { stage } });
  const value = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex w-full flex-col rounded-lg border border-border bg-surface-2/40">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div>
          <p className="text-sm font-semibold text-foreground">{DEAL_STAGE_LABELS[stage]}</p>
          <p className="text-xs text-muted">
            {deals.length} · {formatCurrency(value)}
          </p>
        </div>
        <button
          onClick={() => onAdd(stage)}
          aria-label={`Add deal to ${DEAL_STAGE_LABELS[stage]}`}
          className="rounded p-1.5 text-muted hover:bg-surface hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 p-2.5 min-h-[120px] rounded-b-lg transition-colors",
          isOver && "bg-accent/10"
        )}
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {deals.length === 0 && (
          <p className="text-xs text-muted text-center py-6">No deals here yet.</p>
        )}
      </div>
    </div>
  );
}
