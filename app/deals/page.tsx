"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Plus, DollarSign, TrendingUp, Handshake, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { DealColumn } from "@/components/deals/deal-column";
import { DealFormDialog } from "@/components/deals/deal-form-dialog";
import { DeleteDealDialog } from "@/components/deals/delete-deal-dialog";
import { useDeals, useDealStats } from "@/hooks/use-deals";
import { useMoveDeal } from "@/hooks/use-deal-mutations";
import { Deal, DEAL_STAGES, DealStage } from "@/types/deal";
import { formatCurrency } from "@/lib/utils";

export default function DealsPage() {
  const { data: deals = [], isLoading } = useDeals();
  const { data: stats } = useDealStats();
  const moveMutation = useMoveDeal();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [defaultStage, setDefaultStage] = useState<DealStage>("lead");
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  function openAdd(stage: DealStage = "lead") {
    setEditingDeal(null);
    setDefaultStage(stage);
    setFormOpen(true);
  }

  function openEdit(deal: Deal) {
    setEditingDeal(deal);
    setFormOpen(true);
  }

  function openDelete(deal: Deal) {
    setDeletingDeal(deal);
    setDeleteOpen(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const deal = active.data.current?.deal as Deal | undefined;
    const targetStage = over.id as DealStage;
    if (!deal || deal.stage === targetStage) return;
    moveMutation.mutate({ id: deal.id, stage: targetStage });
  }

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Deals Pipeline</h2>
          <p className="text-sm text-muted">Drag cards between stages to update them.</p>
        </div>
        <Button onClick={() => openAdd()}>
          <Plus className="h-4 w-4" />
          Add Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Handshake}
          label="Open Deals"
          value={stats ? stats.openCount.toLocaleString() : "…"}
        />
        <StatCard
          icon={DollarSign}
          label="Open Pipeline Value"
          value={stats ? formatCurrency(stats.openValue) : "…"}
        />
        <StatCard
          icon={Trophy}
          label="Won Value"
          value={stats ? formatCurrency(stats.wonValue) : "…"}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Deals"
          value={stats ? stats.total.toLocaleString() : "…"}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Loading deals…</p>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {DEAL_STAGES.map((stage) => (
              <DealColumn
                key={stage}
                stage={stage}
                deals={deals.filter((d) => d.stage === stage)}
                onAdd={openAdd}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}
          </div>
        </DndContext>
      )}

      <DealFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        deal={editingDeal}
        defaultStage={defaultStage}
      />
      <DeleteDealDialog open={deleteOpen} onOpenChange={setDeleteOpen} deal={deletingDeal} />
    </div>
  );
}
