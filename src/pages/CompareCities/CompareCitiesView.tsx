import type { TMiniMapLocation } from "@/components";
import { MiniMap, SearchBar, TempPrecipChart, ThreeDotsScaleLoader } from "@/components";
import { PageWrapper } from "@/components/UI";
import { CELL_SIZE_OPTIONS } from "@/constants";
import {
  CLIMATE_COMPARISON_COLORS,
  computeCompareStats,
  computeDiffStats,
} from "@/pages/ClimateComparison/ClimateComparison.util";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  TCitySearchRowProps,
  TCompareCitiesViewProps,
  TDiffCardProps,
  TStatsGridProps,
} from "./CompareCities.type";

function CitySearchRow({ label, dotColor, onCitySelect }: TCitySearchRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
        <span className="text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)]">
          {label}
        </span>
      </div>
      <SearchBar onCitySelect={onCitySelect} />
    </div>
  );
}

function StatsGrid({ labelA, labelB, statsA, statsB, activeColumn }: TStatsGridProps) {
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
              className={`px-4 py-2.5 text-center font-semibold transition-colors duration-200 ${activeColumn === 1 ? "bg-[#EBF4FF]" : ""}`}
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
                className={`px-4 py-2.5 text-center font-semibold transition-colors duration-200 ${activeColumn === 1 ? "bg-[#EBF4FF]" : ""}`}
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

function DiffCard({ title, value, sub, valueColor }: TDiffCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
        {title}
      </span>
      <span
        className="text-[length:var(--font-lg)] font-bold leading-snug"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
      <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">{sub}</span>
    </div>
  );
}

export function CompareCitiesView({
  cityA,
  cityB,
  dataA,
  dataB,
  autoGrid,
  isLoading,
  error,
  onCityASelect,
  onCityBSelect,
}: TCompareCitiesViewProps) {
  const { t } = useTranslation();
  const [activeCity, setActiveCity] = useState(0);

  const hasBothData = dataA.length > 0 && dataB.length > 0;
  const statsA = hasBothData ? computeCompareStats(dataA) : null;
  const statsB = hasBothData ? computeCompareStats(dataB) : null;
  const diff = hasBothData ? computeDiffStats(dataA, dataB) : null;

  const labelA = cityA.label;
  const labelB = cityB.label;

  const miniMapLocations: TMiniMapLocation[] = [
    {
      lat: cityA.lat,
      lng: cityA.lng,
      label: cityA.label,
      color: CLIMATE_COMPARISON_COLORS.A.tmax,
    },
    {
      lat: cityB.lat,
      lng: cityB.lng,
      label: cityB.label,
      color: CLIMATE_COMPARISON_COLORS.B.tmax,
    },
  ];

  return (
    <PageWrapper>
      <div className="flex flex-col gap-10">
        <header className="text-center">
          <h1 className="mb-2 text-[length:var(--font-xl)] lg:text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
            {t("compareCities.title")}
          </h1>
        </header>

        <p className="text-center text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
          {t("climateComparison.autoResolution", { resolution: CELL_SIZE_OPTIONS[autoGrid] })}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CitySearchRow
                label={t("climateComparison.searchA")}
                dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
                onCitySelect={onCityASelect}
              />
              <CitySearchRow
                label={t("climateComparison.searchB")}
                dotColor={CLIMATE_COMPARISON_COLORS.B.tmax}
                onCitySelect={onCityBSelect}
              />
            </div>
          </div>

          <div className="h-[120px] w-full shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm sm:h-[160px] sm:w-[260px]">
            <MiniMap
              locations={miniMapLocations}
              activeIndex={activeCity}
              onToggle={setActiveCity}
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-12">
            <ThreeDotsScaleLoader className="text-[var(--color-primary)]" size={80} />
          </div>
        )}

        {error && !isLoading && (
          <div className="px-4 py-3 text-center text-[var(--color-error)] bg-[var(--color-error-bg)] rounded-[var(--radius-md)] border border-[var(--color-error-border)]">
            {error.message}
          </div>
        )}

        {!hasBothData && !isLoading && !error && (
          <p className="text-center text-[var(--color-text-secondary)]">
            {t("climateComparison.noData")}
          </p>
        )}

        {hasBothData && statsA && statsB && (
          <StatsGrid
            labelA={labelA}
            labelB={labelB}
            statsA={statsA}
            statsB={statsB}
            activeColumn={activeCity}
          />
        )}

        {hasBothData && (
          <TempPrecipChart
            dataA={dataA}
            dataB={dataB}
            labelA={labelA}
            labelB={labelB}
            compareMode="cities"
          />
        )}

        {hasBothData && diff && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <DiffCard
              title={t("climateComparison.diff.warmerCity")}
              value={
                diff.warmerCity === "tie"
                  ? t("climateComparison.diff.tie")
                  : diff.warmerCity === "A"
                    ? labelA
                    : labelB
              }
              sub={
                diff.warmerCity === "tie"
                  ? "="
                  : t("climateComparison.diff.byDegrees", { value: diff.tmaxDiff.toFixed(1) })
              }
              valueColor={
                diff.warmerCity === "A"
                  ? CLIMATE_COMPARISON_COLORS.A.tmax
                  : diff.warmerCity === "B"
                    ? CLIMATE_COMPARISON_COLORS.B.tmax
                    : undefined
              }
            />
            <DiffCard
              title={t("climateComparison.diff.moreRain")}
              value={
                diff.moreRainCity === "tie"
                  ? t("climateComparison.diff.tie")
                  : diff.moreRainCity === "A"
                    ? labelA
                    : labelB
              }
              sub={
                diff.moreRainCity === "tie"
                  ? "="
                  : t("climateComparison.diff.byMm", { value: diff.precDiff.toFixed(0) })
              }
              valueColor={
                diff.moreRainCity === "A"
                  ? CLIMATE_COMPARISON_COLORS.A.tmax
                  : diff.moreRainCity === "B"
                    ? CLIMATE_COMPARISON_COLORS.B.tmax
                    : undefined
              }
            />
            <DiffCard
              title={t("climateComparison.diff.hottestMonth")}
              value={diff.hottestMonthName}
              sub={`${labelA}: ${diff.hottestTempA.toFixed(1)}°C / ${labelB}: ${diff.hottestTempB.toFixed(1)}°C`}
            />
            <DiffCard
              title={t("climateComparison.diff.coldestMonth")}
              value={diff.coldestMonthName}
              sub={`${labelA}: ${diff.coldestTempA.toFixed(1)}°C / ${labelB}: ${diff.coldestTempB.toFixed(1)}°C`}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
