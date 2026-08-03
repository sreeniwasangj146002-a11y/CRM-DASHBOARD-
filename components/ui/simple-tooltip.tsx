"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SimpleTooltipProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * Minimal hover tooltip built with plain CSS (group-hover), avoiding a new
 * dependency just for the sidebar's collapsed-mode labels.
 */
export function SimpleTooltip({ label, children, className }: SimpleTooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-surface-2 px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-lg transition-opacity duration-100 group-hover/tooltip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
