"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hasHydrated);
  const collapsed = useSidebarStore((s) => s.collapsed);
  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    if (hydrated && !isLoginRoute && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isLoginRoute, isAuthenticated, router]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (!hydrated || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
