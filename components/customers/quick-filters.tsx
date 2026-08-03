"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCompanies } from "@/hooks/use-companies";
import { CustomerFilters } from "@/types/customer";

interface QuickFiltersProps {
  filters: CustomerFilters;
  onChange: (filters: CustomerFilters) => void;
}

/** Fast single-value Status/Company selects for quick narrowing, separate from
 * the full multi-select Filters panel (which supports combining many values). */
export function QuickFilters({ filters, onChange }: QuickFiltersProps) {
  const { data: companies = [] } = useCompanies();

  const statusValue = filters.status.length === 1 ? filters.status[0] : "all";
  const companyValue = filters.companies.length === 1 ? filters.companies[0] : "all";

  return (
    <div className="flex items-center gap-2">
      <Select
        value={statusValue}
        onValueChange={(v) => onChange({ ...filters, status: v === "all" ? [] : [v as "active" | "inactive"] })}
      >
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="Status: All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Status: All</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={companyValue}
        onValueChange={(v) => onChange({ ...filters, companies: v === "all" ? [] : [v] })}
      >
        <SelectTrigger className="h-9 w-[150px]">
          <SelectValue placeholder="Company: All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Company: All</SelectItem>
          {companies.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
