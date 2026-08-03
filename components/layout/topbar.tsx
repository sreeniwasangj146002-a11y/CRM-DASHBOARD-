"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsBell } from "@/components/layout/notifications-bell";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/contacts": "Contacts",
  "/deals": "Deals",
  "/tasks": "Tasks",
  "/settings": "Settings",
};

function pageTitle(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  const base = "/" + pathname.split("/")[1];
  return TITLES[base] ?? "Greentiq CRM";
}

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden -ml-1 rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="font-semibold text-foreground shrink-0">{pageTitle(pathname)}</h1>

        <div className="ml-auto flex items-center gap-1.5">
          <NotificationsBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
