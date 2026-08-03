import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down";
  href?: string;
}

export function StatCard({ icon: Icon, label, value, trend, trendDirection, href }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center gap-2 text-muted mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      {trend && (
        <p
          className={cn(
            "text-xs mt-1 font-medium",
            trendDirection === "down" ? "text-danger" : "text-accent"
          )}
        >
          {trend}
        </p>
      )}
    </>
  );

  const className = cn(
    "flex-1 min-w-[180px] rounded-lg border border-border bg-surface p-4 block",
    href && "transition-colors hover:border-accent/40 hover:bg-surface-2/60 cursor-pointer"
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
