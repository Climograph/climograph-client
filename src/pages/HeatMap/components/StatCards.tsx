import { useTranslation } from "react-i18next";
import type { TStatCardProps, TStatsGridProps } from "../HeatMap.type";

function StatCard({ label, value }: TStatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-[length:var(--font-xl)] font-bold leading-none text-[var(--color-text)]">
        {value}
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      <div className="h-3 w-16 animate-pulse rounded bg-[var(--color-border)]" />
      <div className="h-7 w-20 animate-pulse rounded bg-[var(--color-border)]" />
    </div>
  );
}

export function StatsGrid({ hasData, stats, unit }: TStatsGridProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {hasData ? (
        <>
          <StatCard label={t("heatMap.stats.minValue")} value={`${stats.min.toFixed(1)} ${unit}`} />
          <StatCard label={t("heatMap.stats.maxValue")} value={`${stats.max.toFixed(1)} ${unit}`} />
          <StatCard label={t("heatMap.stats.avgValue")} value={`${stats.avg.toFixed(1)} ${unit}`} />
          <StatCard label={t("heatMap.stats.cellsAnalyzed")} value={String(stats.count)} />
        </>
      ) : (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}
    </div>
  );
}
