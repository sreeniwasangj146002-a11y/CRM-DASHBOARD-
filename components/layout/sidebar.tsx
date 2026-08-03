"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Handshake,
  ListChecks,
  Settings,
  Leaf,
  X,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { useAuthStore } from "@/hooks/use-auth-store";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function SidebarContent({
  pathname,
  collapsed,
  onToggleCollapse,
  showCollapseToggle,
}: {
  pathname: string;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  showCollapseToggle?: boolean;
}) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const username = useAuthStore((s) => s.username);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      <div
        className={cn(
          "flex h-14 items-center gap-2 border-b border-border",
          collapsed ? "justify-center px-2" : "px-5"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
          <Leaf className="h-4.5 w-4.5" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-foreground tracking-tight truncate">
            Greentiq CRM
          </span>
        )}
      </div>

      <nav className={cn("flex-1 overflow-y-auto py-4 space-y-1", collapsed ? "px-2" : "px-3")}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          const link = (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2",
                active
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && label}
            </Link>
          );
          return collapsed ? (
            <SimpleTooltip key={href} label={label} className="block w-full">
              {link}
            </SimpleTooltip>
          ) : (
            link
          );
        })}
      </nav>

      {showCollapseToggle && (
        <div className={cn("border-t border-border py-2", collapsed ? "px-2" : "px-3")}>
          {collapsed ? (
            <SimpleTooltip label="Expand sidebar" className="block w-full">
              <button
                onClick={onToggleCollapse}
                aria-label="Expand sidebar"
                className="flex w-full items-center justify-center rounded-md py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <ChevronsRight className="h-4.5 w-4.5 shrink-0" />
              </button>
            </SimpleTooltip>
          ) : (
            <button
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <ChevronsLeft className="h-4.5 w-4.5 shrink-0" />
              Collapse
            </button>
          )}
        </div>
      )}

      <div className={cn("border-t border-border py-4", collapsed ? "px-2" : "px-3")}>
        {collapsed ? (
          <SimpleTooltip label={username ? `Sign out (${username})` : "Sign out"} className="block w-full">
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              className="flex w-full items-center justify-center rounded-md py-2.5 text-muted hover:bg-surface-2 hover:text-foreground"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-accent text-[11px] font-semibold">
                {(username ?? "U").slice(0, 2).toUpperCase()}
              </div>
            </button>
          </SimpleTooltip>
        ) : (
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-semibold">
              {(username ?? "U").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">Alex R.</p>
              <p className="text-xs text-muted truncate">Sales Manager</p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-20 border-r border-border bg-surface transition-[width] duration-200",
          collapsed ? "lg:w-[72px]" : "lg:w-64"
        )}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          onToggleCollapse={toggle}
          showCollapseToggle
        />
      </aside>

      {/* Mobile drawer (always expanded) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-border bg-surface shadow-2xl">
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-3 top-3 rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <SidebarContent pathname={pathname} collapsed={false} />
          </aside>
        </div>
      )}
    </>
  );
}
