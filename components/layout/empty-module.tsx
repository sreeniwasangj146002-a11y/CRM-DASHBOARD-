import { LucideIcon } from "lucide-react";

interface EmptyModuleProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyModule({ icon: Icon, title, description }: EmptyModuleProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface py-24 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent mb-4">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted mt-1.5 max-w-sm">{description}</p>
      </div>
    </div>
  );
}
