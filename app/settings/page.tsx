"use client";

import { useQuery } from "@tanstack/react-query";
import { Moon, Sun, Database, CircleCheck, CircleAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

interface HealthResponse {
  ok: boolean;
  database: string;
  host: string;
  error?: string;
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  const { data: health, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["health"],
    queryFn: async (): Promise<HealthResponse> => {
      const res = await fetch("/api/health");
      return res.json();
    },
    staleTime: 10_000,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted">Manage your workspace preferences.</p>
      </div>

      {/* Database connection */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center gap-2 mb-1">
          <Database className="h-4.5 w-4.5 text-accent" />
          <h3 className="font-semibold text-foreground">Database Connection</h3>
        </div>
        <p className="text-sm text-muted mb-4">
          Customer data is persisted to a MongoDB server. This checks that the connection is live.
        </p>

        <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-2 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            {isLoading ? (
              <RefreshCw className="h-5 w-5 text-muted animate-spin shrink-0" />
            ) : health?.ok ? (
              <CircleCheck className="h-5 w-5 text-accent shrink-0" />
            ) : (
              <CircleAlert className="h-5 w-5 text-danger shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {isLoading
                  ? "Checking connection…"
                  : health?.ok
                  ? "Connected"
                  : "Not connected"}
              </p>
              <p className="text-xs text-muted truncate">
                {health ? `${health.host} · db: ${health.database}` : ""}
              </p>
              {health && !health.ok && health.error && (
                <p className="text-xs text-danger mt-1">{health.error}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Recheck
          </Button>
        </div>

        {health && !health.ok && (
          <p className="text-xs text-muted mt-3">
            Make sure a local MongoDB server is running (e.g. <code className="px-1 py-0.5 rounded bg-surface-2">mongod</code>),
            or set <code className="px-1 py-0.5 rounded bg-surface-2">MONGODB_URI</code> in{" "}
            <code className="px-1 py-0.5 rounded bg-surface-2">.env.local</code> to point at your server.
          </p>
        )}
      </section>

      {/* Appearance */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="font-semibold text-foreground mb-1">Appearance</h3>
        <p className="text-sm text-muted mb-4">Choose how Greentiq CRM looks on this device.</p>

        <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-2 px-4 py-3">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="h-4.5 w-4.5 text-accent" />
            ) : (
              <Sun className="h-4.5 w-4.5 text-accent" />
            )}
            <span className="text-sm font-medium text-foreground capitalize">{theme} mode</span>
          </div>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            Switch to {theme === "dark" ? "Light" : "Dark"}
          </Button>
        </div>
      </section>
    </div>
  );
}
