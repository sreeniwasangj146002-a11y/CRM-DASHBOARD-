"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, UserCheck, Clock3, Building2, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { GrowthChart } from "@/components/dashboard/growth-chart";
import { useCustomers } from "@/hooks/use-customers";
import { useCustomerStats } from "@/hooks/use-customer-stats";
import { cn, formatDate } from "@/lib/utils";
import { CustomerAvatar } from "@/components/customers/customer-avatar";

export default function DashboardPage() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useCustomerStats();
  const { data: recent, isLoading: recentLoading } = useCustomers({
    sortField: "lastContactDate",
    sortDirection: "desc",
    page: 1,
    pageSize: 6,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Welcome back, Alex</h2>
          <p className="text-sm text-muted">Here&apos;s what&apos;s happening with your customers today.</p>
        </div>
        <Button onClick={() => router.push("/contacts?new=1")}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Customers"
          value={stats ? stats.total.toLocaleString() : statsLoading ? "…" : "0"}
          href="/contacts"
        />
        <StatCard
          icon={UserCheck}
          label="Active Customers"
          value={stats ? stats.active.toLocaleString() : statsLoading ? "…" : "0"}
          trend={
            stats
              ? `${Math.round((stats.active / Math.max(stats.total, 1)) * 100)}% of total`
              : undefined
          }
          href="/contacts?status=active"
        />
        <StatCard
          icon={Clock3}
          label="Contacted This Week"
          value={stats ? stats.contactedThisWeek.toLocaleString() : statsLoading ? "…" : "0"}
          href="/contacts"
        />
        <StatCard
          icon={Building2}
          label="Companies"
          value={stats ? stats.companyCount.toLocaleString() : statsLoading ? "…" : "0"}
          href="/contacts"
        />
      </div>

      {/* Real-time growth chart (refreshes automatically, driven by actual createdAt data) */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-foreground">New Customers (Last 14 Days)</h3>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Live
          </span>
        </div>
        {statsLoading && <Skeleton className="h-[200px] w-full mt-3" />}
        {!statsLoading && <GrowthChart data={stats?.growth ?? []} />}
      </div>

      {/* Recent customers */}
      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recently Contacted</h3>
          <Link
            href="/contacts"
            className="flex items-center gap-1 text-sm text-accent hover:underline"
          >
            View all contacts <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-border-subtle">
          {recentLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3.5">
                <Skeleton className="h-8 w-full" />
              </div>
            ))}

          {!recentLoading && recent?.data.length === 0 && (
            <p className="px-4 py-12 text-center text-muted text-sm">
              No customers yet.{" "}
              <Link href="/contacts?new=1" className="text-accent hover:underline">
                Add your first customer
              </Link>
              .
            </p>
          )}

          {!recentLoading &&
            recent?.data.map((customer) => (
              <Link
                key={customer.id}
                href="/contacts"
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2/60 transition-colors"
              >
                <CustomerAvatar name={customer.name} photoUrl={customer.photoUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{customer.name}</p>
                  <p className="text-xs text-muted truncate">
                    {customer.company || "—"} · {customer.email}
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <Badge variant={customer.status === "active" ? "active" : "inactive"}>
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        customer.status === "active" ? "bg-accent" : "bg-muted-2"
                      )}
                    />
                    {customer.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-xs text-muted">{formatDate(customer.lastContactDate)}</span>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/contacts"
          className="rounded-lg border border-border bg-surface p-4 hover:border-accent/40 transition-colors"
        >
          <Users className="h-5 w-5 text-accent mb-2" />
          <p className="font-medium text-foreground">Manage Contacts</p>
          <p className="text-xs text-muted mt-0.5">Search, filter, and edit your customer list.</p>
        </Link>
        <Link
          href="/deals"
          className="rounded-lg border border-border bg-surface p-4 hover:border-accent/40 transition-colors"
        >
          <ArrowRight className="h-5 w-5 text-accent mb-2 rotate-[-45deg]" />
          <p className="font-medium text-foreground">Deals Pipeline</p>
          <p className="text-xs text-muted mt-0.5">Track active deals and revenue by stage.</p>
        </Link>
        <Link
          href="/tasks"
          className="rounded-lg border border-border bg-surface p-4 hover:border-accent/40 transition-colors"
        >
          <Clock3 className="h-5 w-5 text-accent mb-2" />
          <p className="font-medium text-foreground">Tasks</p>
          <p className="text-xs text-muted mt-0.5">Follow-ups and reminders for your customers.</p>
        </Link>
      </div>
    </div>
  );
}
