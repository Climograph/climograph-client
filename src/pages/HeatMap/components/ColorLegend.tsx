import { interpolateColor } from "@/utils";
import type { TColorLegendProps, TLegendPanelProps } from "../HeatMap.type";

function ColorLegend({ min, max, scale, unit }: TColorLegendProps) {
  const gradientColors = Array.from({ length: 10 }, (_, i) =>
    interpolateColor(min + (max - min) * (i / 9), min, max, scale),
  );
  const gradient = `linear-gradient(to right, ${gradientColors.join(", ")})`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-5 w-full rounded" style={{ background: gradient }} />
      <div className="flex justify-between">
        <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
          {min.toFixed(1)} {unit}
        </span>
        <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
          {max.toFixed(1)} {unit}
        </span>
      </div>
    </div>
  );
}

function SkeletonLegend() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-5 w-full animate-pulse rounded bg-[var(--color-border)]" />
      <div className="flex justify-between">
        <div className="h-3 w-12 animate-pulse rounded bg-[var(--color-border)]" />
        <div className="h-3 w-12 animate-pulse rounded bg-[var(--color-border)]" />
      </div>
    </div>
  );
}

export function LegendPanel({ hasData, stats, scale, unit }: TLegendPanelProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      {hasData ? (
        <ColorLegend min={stats.min} max={stats.max} scale={scale} unit={unit} />
      ) : (
        <SkeletonLegend />
      )}
    </div>
  );
}
