import { getMartonneBadge } from "@/utils";
import { useTranslation } from "react-i18next";
import type { TClimateStatsBarProps } from "./ClimateStatsBar.type";

const CELL_BORDER = "0.5px solid var(--color-border)";

export function ClimateStatsBar({
  meanTemp,
  annualPrecip,
  aridMonths,
  altitude,
  martonneIndex,
}: TClimateStatsBarProps) {
  const { t } = useTranslation();
  const badge = getMartonneBadge(martonneIndex);
  const martonneDisplay = martonneIndex !== null ? martonneIndex.toFixed(1) : "—";
  const colCount = altitude !== undefined ? 5 : 4;

  return (
    <div
      className="mb-3 grid overflow-hidden rounded-[var(--radius-md)]"
      style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)`, border: CELL_BORDER }}
    >
      <div
        className="flex items-center justify-between px-4 py-[10px]"
        style={{ borderRight: CELL_BORDER }}
      >
        <span className="text-[11px] text-[var(--color-text-secondary)]">{t("chart.meanTemp")}</span>
        <span className="text-[16px] font-medium text-[var(--color-text)]">
          {meanTemp.toFixed(1)}°C
        </span>
      </div>

      <div
        className="flex items-center justify-between px-4 py-[10px]"
        style={{ borderRight: CELL_BORDER }}
      >
        <span className="text-[11px] text-[var(--color-text-secondary)]">{t("chart.annualPrec")}</span>
        <span className="text-[16px] font-medium text-[var(--color-text)]">{annualPrecip} mm</span>
      </div>

      <div
        className="flex items-center justify-between px-4 py-[10px]"
        style={{ borderRight: CELL_BORDER }}
      >
        <span className="text-[11px] text-[var(--color-text-secondary)]">{t("chart.aridMonths")}</span>
        <span className="text-[16px] font-medium text-[var(--color-text)]">{aridMonths}</span>
      </div>

      {altitude !== undefined && (
        <div
          className="flex items-center justify-between px-4 py-[10px]"
          style={{ borderRight: CELL_BORDER }}
        >
          <span className="text-[11px] text-[var(--color-text-secondary)]">{t("chart.altitude")}</span>
          <span className="text-[16px] font-medium text-[var(--color-text)]">{altitude} m</span>
        </div>
      )}

      <div
        className="flex items-center justify-between px-4 py-[10px]"
        style={badge ? { backgroundColor: badge.bg } : {}}
        title={t("chart.martonneTooltip")}
      >
        <span
          className="text-[11px]"
          style={{ color: badge ? badge.color : "var(--color-text-secondary)" }}
        >
          {t("chart.martonne")}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="text-[16px] font-medium"
            style={{ color: badge ? badge.color : "var(--color-text)", cursor: "help" }}
          >
            {martonneDisplay}
          </span>
          {badge && (
            <span className="text-[10px] font-medium" style={{ color: badge.color }}>
              {t(badge.labelKey)}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
