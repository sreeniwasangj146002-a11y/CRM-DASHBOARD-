import { cn, initials } from "@/lib/utils";

interface CustomerAvatarProps {
  name: string;
  photoUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-base",
};

export function CustomerAvatar({ name, photoUrl, size = "md", className }: CustomerAvatarProps) {
  if (photoUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-surface-2",
          SIZE_MAP[size],
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold",
        SIZE_MAP[size],
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
