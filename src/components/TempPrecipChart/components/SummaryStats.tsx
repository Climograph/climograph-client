import { useTranslation } from "react-i18next";
import type { TSummaryStatsProps } from "../TempPrecipChart.type";

export function SummaryStats({ summary }: TSummaryStatsProps) {
  const { t } = useTranslation();
  return (
    <p className="mb-3 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
      {t("chart.meanTemp")}: {summary.annualAvgTemp}°C
      {" | "}
      {t("chart.annualPrec")}: {summary.totalPrec} mm
      {" | "}
      {t("chart.aridMonths")}: {summary.aridCount}
    </p>
  );
}
