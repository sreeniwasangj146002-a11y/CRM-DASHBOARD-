"use client";

import { useMemo, useState } from "react";

interface GrowthChartProps {
  data: { date: string; count: number }[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.count)), [data]);
  const width = 700;
  const height = 200;
  const padding = 24;
  const barGap = 6;
  const barWidth = data.length > 0 ? (width - padding * 2) / data.length - barGap : 0;

  if (data.every((d) => d.count === 0)) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted">
        No new customers yet — new signups will show up here.
      </div>
    );
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[200px]" preserveAspectRatio="none">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padding}
            x2={width - padding}
            y1={height - padding - f * (height - padding * 1.5)}
            y2={height - padding - f * (height - padding * 1.5)}
            stroke="var(--border-subtle)"
            strokeDasharray="3 4"
          />
        ))}
        {data.map((d, i) => {
          const barHeight = (d.count / max) * (height - padding * 1.5);
          const x = padding + i * (barWidth + barGap);
          const y = height - padding - barHeight;
          const isHovered = hovered === i;
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={Math.max(barWidth, 2)}
                height={Math.max(barHeight, d.count > 0 ? 2 : 0)}
                rx={3}
                fill={isHovered ? "var(--accent-strong)" : "var(--accent)"}
                opacity={isHovered ? 1 : 0.85}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="transition-[opacity,fill] duration-100 cursor-pointer"
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-1 flex justify-between text-[10px] text-muted-2">
        <span>{formatShort(data[0]?.date)}</span>
        <span>{formatShort(data[Math.floor(data.length / 2)]?.date)}</span>
        <span>{formatShort(data[data.length - 1]?.date)}</span>
      </div>

      {hovered !== null && data[hovered] && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-xs shadow-lg">
          <p className="font-medium text-foreground">{formatShort(data[hovered].date)}</p>
          <p className="text-muted">
            {data[hovered].count} new customer{data[hovered].count === 1 ? "" : "s"}
          </p>
        </div>
      )}
    </div>
  );
}

function formatShort(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
