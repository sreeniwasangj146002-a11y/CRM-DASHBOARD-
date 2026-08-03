"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerFilters } from "@/types/customer";

interface FiltersTriggerProps {
  filters: CustomerFilters;
  open: boolean;
  onToggle: () => void;
}

function countActive(filters: CustomerFilters) {
  let n = 0;
  if (filters.status.length) n++;
  if (filters.companies.length) n++;
  if (filters.dateFrom || filters.dateTo) n++;
  if (filters.phone) n++;
  if (filters.email) n++;
  return n;
}

/**
 * Just the toggle button. The actual panel is `FiltersAside`, rendered as a
 * sibling next to the table (not an overlay), so opening filters never hides
 * the customer list — it pushes the layout instead.
 */
export function FiltersTrigger({ filters, open, onToggle }: FiltersTriggerProps) {
  const activeCount = countActive(filters);
  return (
    <Button variant={open ? "default" : "secondary"} onClick={onToggle}>
      <SlidersHorizontal className="h-4 w-4" />
      Filters
      {activeCount > 0 && (
        <Badge variant="active" className="ml-0.5 h-5 min-w-5 justify-center px-1">
          {activeCount}
        </Badge>
      )}
    </Button>
  );
}
