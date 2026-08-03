"use client";

import { Bell, CheckCheck, PackageX, Info, CheckCircle2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNotifications, NotificationType } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

function iconFor(type: NotificationType) {
  if (type === "success") return <CheckCircle2 className="h-4 w-4 text-accent" />;
  if (type === "error") return <PackageX className="h-4 w-4 text-danger" />;
  return <Info className="h-4 w-4 text-muted" />;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function NotificationsBell() {
  const items = useNotifications((s) => s.items);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const clear = useNotifications((s) => s.clear);
  const unread = items.filter((i) => !i.read).length;

  return (
    <Popover onOpenChange={(open) => open && unread > 0 && markAllRead()}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative rounded-md p-2 text-muted hover:bg-surface-2 hover:text-foreground"
        >
          <Bell className="h-4.5 w-4.5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 max-h-[26rem] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear} className="text-xs text-muted">
              <CheckCheck className="h-3.5 w-3.5" /> Clear all
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border-subtle">
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted">
              No notifications yet. Actions like adding or deleting a record will show up here.
            </p>
          )}
          {items.map((n) => (
            <div
              key={n.id}
              className={cn("flex items-start gap-2.5 px-4 py-2.5", !n.read && "bg-accent/5")}
            >
              <div className="mt-0.5 shrink-0">{iconFor(n.type)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                {n.description && (
                  <p className="text-xs text-muted truncate">{n.description}</p>
                )}
              </div>
              <span className="shrink-0 text-[11px] text-muted-2 whitespace-nowrap">
                {timeAgo(n.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
