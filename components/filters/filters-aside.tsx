"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SortableSavedFilter } from "./sortable-saved-filter";
import { CustomerFilters, CustomerStatus, EMPTY_FILTERS } from "@/types/customer";
import { useSavedFilters } from "@/hooks/use-saved-filters";
import { useCompanies } from "@/hooks/use-companies";

interface FiltersAsideProps {
  open: boolean;
  onClose: () => void;
  filters: CustomerFilters;
  onApply: (filters: CustomerFilters) => void;
}

/**
 * Renders inline (no portal, no dark overlay) as a sibling column next to the
 * customer table, so the table stays fully visible and usable while filters
 * are open — it pushes the layout rather than hiding the list underneath it.
 */
export function FiltersAside({ open, onClose, filters, onApply }: FiltersAsideProps) {
  const [draft, setDraft] = useState<CustomerFilters>(filters);
  const [prevOpen, setPrevOpen] = useState(open);
  const [filterName, setFilterName] = useState("");
  const { saved, addFilter, removeFilter, reorder } = useSavedFilters();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Re-sync the draft from the applied filters each time the panel opens,
  // adjusted during render (per React's guidance) rather than in an effect.
  if (open && !prevOpen) {
    setPrevOpen(true);
    setDraft(filters);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  if (!open) return null;

  function toggleStatus(status: CustomerStatus) {
    setDraft((d) => ({
      ...d,
      status: d.status.includes(status)
        ? d.status.filter((s) => s !== status)
        : [...d.status, status],
    }));
  }

  function toggleCompany(company: string) {
    setDraft((d) => ({
      ...d,
      companies: d.companies.includes(company)
        ? d.companies.filter((c) => c !== company)
        : [...d.companies, company],
    }));
  }

  function handleApply() {
    onApply(draft);
  }

  function handleClearAll() {
    setDraft(EMPTY_FILTERS);
    onApply(EMPTY_FILTERS);
  }

  function handleSaveFilter() {
    if (!filterName.trim()) return;
    addFilter(filterName.trim(), draft);
    setFilterName("");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id));
    }
  }

  return (
    <aside className="w-full shrink-0 rounded-lg border border-border bg-surface p-4 sm:w-80 animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-muted">
            Clear All
          </Button>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-sm p-1 text-muted opacity-70 hover:opacity-100 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-6 max-h-[70vh] overflow-y-auto pb-2 pr-1">
        {/* Status */}
        <section>
          <Label className="mb-2 block">Status</Label>
          <div className="space-y-2">
            {(["active", "inactive"] as CustomerStatus[]).map((status) => (
              <label key={status} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={draft.status.includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                />
                <span className="capitalize">{status} Customers</span>
              </label>
            ))}
          </div>
        </section>

        {/* Company */}
        <section>
          <Label className="mb-2 block">Company</Label>
          <div className="max-h-36 overflow-y-auto space-y-2 rounded-md border border-border-subtle p-2.5">
            {companiesLoading && <p className="text-xs text-muted py-1">Loading companies…</p>}
            {!companiesLoading && companies.length === 0 && (
              <p className="text-xs text-muted py-1">No companies yet.</p>
            )}
            {companies.map((company) => (
              <label key={company} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={draft.companies.includes(company)}
                  onCheckedChange={() => toggleCompany(company)}
                />
                <span>{company}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Date range */}
        <section>
          <Label className="mb-2 block">Date Range (Last Contact)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-muted">From</span>
              <Input
                type="date"
                value={draft.dateFrom ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, dateFrom: e.target.value || null }))}
              />
            </div>
            <div>
              <span className="text-xs text-muted">To</span>
              <Input
                type="date"
                value={draft.dateTo ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, dateTo: e.target.value || null }))}
              />
            </div>
          </div>
        </section>

        {/* Phone */}
        <section>
          <Label htmlFor="phone-filter" className="mb-2 block">
            Phone Number
          </Label>
          <Input
            id="phone-filter"
            placeholder="e.g. 555-1234"
            value={draft.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
          />
        </section>

        {/* Email */}
        <section>
          <Label htmlFor="email-filter" className="mb-2 block">
            Email Contains
          </Label>
          <Input
            id="email-filter"
            placeholder="e.g. @gmail.com"
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
          />
        </section>

        <Button onClick={handleApply} className="w-full">
          Apply Filters
        </Button>

        {/* Save current combination */}
        <section className="border-t border-border-subtle pt-5">
          <Label className="mb-2 block">Save Custom Filter</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Filter name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveFilter()}
            />
            <Button variant="secondary" size="icon" onClick={handleSaveFilter} className="shrink-0">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Saved filters, drag to reorder */}
        <section>
          <Label className="mb-2 block">Saved Filters</Label>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={saved.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {saved.map((f) => (
                  <SortableSavedFilter
                    key={f.id}
                    filter={f}
                    isActive={JSON.stringify(f.filters) === JSON.stringify(filters)}
                    onApply={() => {
                      setDraft(f.filters);
                      onApply(f.filters);
                    }}
                    onRemove={() => removeFilter(f.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      </div>
    </aside>
  );
}
