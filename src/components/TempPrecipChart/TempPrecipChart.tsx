import { FilterChip } from "@/components/FilterChip";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ModeToggle } from "./components/ModeToggle";
import { useTempPrecipChart } from "./hooks/useTempPrecipChart";
import { StandardClimateChart } from "./StandardClimateChart";
import type { TChartMode, TTempPrecipChartProps, TVisibleSeries } from "./TempPrecipChart.type";
import { WLCitiesLayout } from "./WLCitiesLayout";
import { WLPeriodsLayout } from "./WLPeriodsLayout";
import { WalterLiethChart } from "./WalterLiethChart";

const DEFAULT_VISIBLE: TVisibleSeries = { tmax: true, tmin: true, tavg: false, prec: true };

export function TempPrecipChart(props: TTempPrecipChartProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState<TVisibleSeries>(DEFAULT_VISIBLE);
  const [chartMode, setChartMode] = useState<TChartMode>("standard");

  const chart = useTempPrecipChart(props);

  if (!chart.hasData) return null;

  const isWalterLieth = chartMode === "walter-lieth";
  const activeCount = Object.values(visible).filter(Boolean).length;

  function handleToggle(key: keyof TVisibleSeries) {
    if (visible[key] && activeCount === 1) return;
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const selectedMonthName =
    !chart.isCompare && props.selectedMonths?.length === 1
      ? (props.data?.find((d) => d.month === props.selectedMonths![0])?.monthName ?? "")
      : "";

  const chips: { key: keyof TVisibleSeries; label: string }[] = [
    { key: "tmax", label: t("sidebar.variables.tmax") },
    { key: "tmin", label: t("sidebar.variables.tmin") },
    { key: "tavg", label: t("sidebar.variables.tavg") },
    { key: "prec", label: t("sidebar.variables.prec") },
  ];

  return (
    <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ModeToggle mode={chartMode} onChange={setChartMode} />
        {props.cityName && (
          <h3 className="font-semibold text-[length:var(--font-md)] md:text-[length:var(--font-lg)] text-[var(--color-text)]">
            {t("chart.title")}: {props.cityName}
          </h3>
        )}
        {!isWalterLieth && selectedMonthName && (
          <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
            {t("chart.selectedMonth", { month: selectedMonthName })}
          </span>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          {chips.map(({ key, label }) => {
            const isLastActive = visible[key] && activeCount === 1;
            const isDimmed = isWalterLieth && (key === "tmax" || key === "tmin");
            return (
              <div
                key={key}
                className={isLastActive || isDimmed ? "pointer-events-none opacity-40" : ""}
              >
                <FilterChip
                  label={label}
                  isActive={visible[key] && !isDimmed}
                  onClick={() => handleToggle(key)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {isWalterLieth && !chart.isCompare ? (
        <WalterLiethChart
          chartData={chart.chartData}
          scales={chart.scales}
          summary={chart.summary}
        />
      ) : isWalterLieth && props.compareMode === "periods" ? (
        <WLPeriodsLayout
          chartDataA={chart.chartDataA}
          chartDataB={chart.chartDataB}
          scales={chart.scales}
          labelA={props.labelA ?? ""}
          labelB={props.labelB ?? ""}
          summaryA={chart.summaryA}
          summaryB={chart.summaryB}
        />
      ) : isWalterLieth ? (
        <WLCitiesLayout
          chartDataA={chart.chartDataA}
          chartDataB={chart.chartDataB}
          labelA={props.labelA ?? ""}
          labelB={props.labelB ?? ""}
          scales={chart.scales}
          summaryA={chart.summaryA}
          summaryB={chart.summaryB}
        />
      ) : (
        <StandardClimateChart
          chartData={chart.chartData}
          aridity={chart.aridity}
          aridityA={chart.aridityA}
          scales={chart.scales}
          rightMax={chart.rightMax}
          summary={chart.summary}
          visible={visible}
          isCompare={chart.isCompare}
          {...(props.selectedMonths !== undefined ? { selectedMonths: props.selectedMonths } : {})}
          {...(props.labelA !== undefined ? { labelA: props.labelA } : {})}
          {...(props.labelB !== undefined ? { labelB: props.labelB } : {})}
        />
      )}
    </div>
  );
}
