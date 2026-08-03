"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerAvatar } from "@/components/customers/customer-avatar";
import { Customer, SortField, SortState } from "@/types/customer";
import { formatDate } from "@/lib/utils";

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  sort: SortState;
  onSortChange: (field: SortField) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

function SortIcon({ active, direction }: { active: boolean; direction: string }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-2" />;
  return direction === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-accent" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-accent" />
  );
}

export function CustomerTable({
  customers,
  isLoading,
  sort,
  onSortChange,
  onView,
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: CustomerTableProps) {
  const allSelected = customers.length > 0 && customers.every((c) => selectedIds.includes(c.id));
  const someSelected = customers.some((c) => selectedIds.includes(c.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th className="w-10 px-3 py-2.5">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={onToggleSelectAll}
                aria-label="Select all customers"
              />
            </th>
            <th className="px-3 py-2.5 font-medium">
              <button
                onClick={() => onSortChange("name")}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                Name <SortIcon active={sort.field === "name"} direction={sort.direction} />
              </button>
            </th>
            <th className="px-3 py-2.5 font-medium hidden md:table-cell">
              <button
                onClick={() => onSortChange("email")}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                Email <SortIcon active={sort.field === "email"} direction={sort.direction} />
              </button>
            </th>
            <th className="px-3 py-2.5 font-medium hidden lg:table-cell">Phone</th>
            <th className="px-3 py-2.5 font-medium hidden sm:table-cell">Company</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 font-medium hidden md:table-cell">
              <button
                onClick={() => onSortChange("lastContactDate")}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                Last Contact{" "}
                <SortIcon
                  active={sort.field === "lastContactDate"}
                  direction={sort.direction}
                />
              </button>
            </th>
            <th className="px-3 py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td className="px-3 py-2.5" colSpan={8}>
                  <Skeleton className="h-8 w-full" />
                </td>
              </tr>
            ))}

          {!isLoading && customers.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-16 text-center text-muted">
                No customers match your search or filters.
              </td>
            </tr>
          )}

          {!isLoading &&
            customers.map((customer) => {
              const checked = selectedIds.includes(customer.id);
              return (
                <tr
                  key={customer.id}
                  className={`group hover:bg-surface-2/60 transition-colors cursor-pointer animate-fade-in ${
                    checked ? "bg-accent/5" : ""
                  }`}
                  onClick={() => onView(customer)}
                >
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => onToggleSelect(customer.id)}
                      aria-label={`Select ${customer.name}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <CustomerAvatar name={customer.name} photoUrl={customer.photoUrl} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {customer.name}
                        </p>
                        <p className="text-xs text-muted md:hidden truncate">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell text-foreground/80">
                    {customer.email}
                  </td>
                  <td className="px-3 py-2 hidden lg:table-cell text-foreground/80">
                    {customer.phone || "—"}
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell text-foreground/80">
                    {customer.company || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={customer.status === "active" ? "active" : "inactive"}>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          customer.status === "active" ? "bg-accent" : "bg-muted-2"
                        }`}
                      />
                      {customer.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell text-foreground/80">
                    {formatDate(customer.lastContactDate)}
                  </td>
                  <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(customer)}>
                          <Eye className="h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(customer)}>
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(customer)}
                          className="text-danger focus:text-danger"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
