import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-2 text-foreground border-border",
        active: "bg-accent/15 text-accent border-accent/30",
        inactive: "bg-muted-2/15 text-muted border-muted-2/30",
        outline: "bg-transparent text-muted-foreground border-border",
        danger: "bg-danger/15 text-danger border-danger/30",
        warning: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
