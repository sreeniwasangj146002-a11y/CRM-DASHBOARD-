"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/customers/search-bar";
import { CustomerTable } from "@/components/customers/customer-table";
import { Pagination } from "@/components/customers/pagination";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { CustomerDetailsDialog } from "@/components/customers/customer-details-dialog";
import { DeleteConfirmDialog } from "@/components/customers/delete-confirm-dialog";
import { BulkActionsBar } from "@/components/customers/bulk-actions-bar";
import { QuickFilters } from "@/components/customers/quick-filters";
import { ImportExcelButton } from "@/components/customers/import-excel-button";
import { ExportMenu } from "@/components/customers/export-menu";
import { FiltersTrigger } from "@/components/filters/filters-trigger";
import { FiltersAside } from "@/components/filters/filters-aside";
import { useCustomers } from "@/hooks/use-customers";
import { useDebounce } from "@/hooks/use-debounce";
import { Customer, CustomerFilters, EMPTY_FILTERS, SortField, SortState } from "@/types/customer";

function ContactsPageInner() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebounce(search, 300);
  const initialStatus = searchParams.get("status");
  const [filters, setFilters] = useState<CustomerFilters>(
    initialStatus === "active" || initialStatus === "inactive"
      ? { ...EMPTY_FILTERS, status: [initialStatus] }
      : EMPTY_FILTERS
  );
  const [sort, setSort] = useState<SortState>({ field: "lastContactDate", direction: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(searchParams.get("new") === "1");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Reset to page 1 whenever the query itself changes shape (adjusting state
  // during render, per React's guidance, instead of setState-in-effect).
  const queryKey = JSON.stringify({ debouncedSearch, filters, pageSize });
  const [prevQueryKey, setPrevQueryKey] = useState(queryKey);
  if (queryKey !== prevQueryKey) {
    setPrevQueryKey(queryKey);
    setPage(1);
  }

  // Cmd/Ctrl+K opens the filters panel from anywhere on the page.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setFiltersOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const { data, isLoading, isFetching } = useCustomers({
    search: debouncedSearch,
    status: filters.status,
    companies: filters.companies,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    phone: filters.phone,
    email: filters.email,
    sortField: sort.field,
    sortDirection: sort.direction,
    page,
    pageSize,
  });

  function handleSortChange(field: SortField) {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );
  }

  function openAddDialog() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function openEditDialog(customer: Customer) {
    setDetailsOpen(false);
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  function openDetails(customer: Customer) {
    setViewingCustomer(customer);
    setDetailsOpen(true);
  }

  function openDeleteDialog(customer: Customer) {
    setDetailsOpen(false);
    setDeletingCustomer(customer);
    setDeleteOpen(true);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    const ids = data?.data.map((c) => c.id) ?? [];
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? selectedIds.filter((id) => !ids.includes(id)) : Array.from(new Set([...selectedIds, ...ids])));
  }

  const start = data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const end = data ? Math.min(data.page * data.pageSize, data.total) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Contacts</h2>
          <p className="text-sm text-muted">
            {data ? `${data.total.toLocaleString()} customers` : "Loading customers…"}
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Filters open beside the table (pushes layout) instead of covering it */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="min-w-0 flex-1 rounded-lg border border-border bg-surface">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 p-4 border-b border-border">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <SearchBar value={search} onChange={setSearch} />
              <div className="flex flex-wrap items-center gap-2">
                <QuickFilters filters={filters} onChange={setFilters} />
                <FiltersTrigger
                  filters={filters}
                  open={filtersOpen}
                  onToggle={() => setFiltersOpen((v) => !v)}
                />
                <ImportExcelButton />
                <ExportMenu customers={data?.data ?? []} disabled={!data?.data.length} />
              </div>
            </div>
            {/* Result count, positioned right above the table next to search */}
            {data && data.total > 0 && (
              <p className="text-xs text-muted">
                Showing {start} to {end} of {data.total.toLocaleString()} entries
              </p>
            )}
          </div>

          <BulkActionsBar selectedIds={selectedIds} onClear={() => setSelectedIds([])} />

          <CustomerTable
            customers={data?.data ?? []}
            isLoading={isLoading || (isFetching && !data)}
            sort={sort}
            onSortChange={handleSortChange}
            onView={openDetails}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
          />

          {data && data.total > 0 && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>

        <FiltersAside
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filters={filters}
          onApply={setFilters}
        />
      </div>

      <CustomerFormDialog open={formOpen} onOpenChange={setFormOpen} customer={editingCustomer} />
      <CustomerDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        customer={viewingCustomer}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />
      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} customer={deletingCustomer} />
    </div>
  );
}

export default function ContactsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-muted">Loading…</div>}>
      <ContactsPageInner />
    </Suspense>
  );
}
