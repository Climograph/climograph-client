import { CLIMATE_COMPARISON_COLORS } from "@/pages/ClimateComparison/ClimateComparison.util";
import { useTranslation } from "react-i18next";
import type { TCompareStatsGridProps } from "./CompareStatsGrid.type";

export function CompareStatsGrid({
  labelA,
  labelB,
  statsA,
  statsB,
  activeColumn,
}: TCompareStatsGridProps) {
  const { t } = useTranslation();

  const rows = [
    {
      label: t("climateComparison.stats.avgTmax"),
      a: `${statsA.avgTmax.toFixed(1)} °C`,
      b: `${statsB.avgTmax.toFixed(1)} °C`,
    },
    {
      label: t("climateComparison.stats.avgTmin"),
      a: `${statsA.avgTmin.toFixed(1)} °C`,
      b: `${statsB.avgTmin.toFixed(1)} °C`,
    },
    {
      label: t("climateComparison.stats.totalPrec"),
      a: `${statsA.totalPrec.toFixed(0)} mm`,
      b: `${statsB.totalPrec.toFixed(0)} mm`,
    },
  ];

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <table className="w-full table-fixed text-[length:var(--font-sm)]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <th className="px-4 py-2.5 text-left font-medium text-[var(--color-text-secondary)]" />
            <th
              className={`px-4 py-2.5 text-center font-semibold transition-colors duration-200 ${activeColumn === 0 ? "bg-[var(--color-chip-active-bg)]" : ""}`}
              style={{ color: CLIMATE_COMPARISON_COLORS.A.tmax }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: CLIMATE_COMPARISON_COLORS.A.tmax }}
                />
                {labelA}
              </span>
            </th>
            <th
              className={`px-4 py-2.5 text-center font-semibold transition-colors duration-200 ${activeColumn === 1 ? "bg-[var(--color-city-b-tint)]" : ""}`}
              style={{ color: CLIMATE_COMPARISON_COLORS.B.tmax }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: CLIMATE_COMPARISON_COLORS.B.tmax }}
                />
                {labelB}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              className={`border-b border-[var(--color-border)] last:border-0 ${i % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"}`}
            >
              <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{row.label}</td>
              <td
                className={`px-4 py-2.5 text-center font-semibold transition-colors duration-200 ${activeColumn === 0 ? "bg-[var(--color-chip-active-bg)]" : ""}`}
                style={{ color: CLIMATE_COMPARISON_COLORS.A.tmax }}
              >
                {row.a}
              </td>
              <td
                className={`px-4 py-2.5 text-center font-semibold transition-colors duration-200 ${activeColumn === 1 ? "bg-[var(--color-city-b-tint)]" : ""}`}
                style={{ color: CLIMATE_COMPARISON_COLORS.B.tmax }}
              >
                {row.b}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
