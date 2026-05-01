import type { TMiniMapLocation } from "@/components";
import {
  MiniMap,
  PeriodSelectRow,
  SearchBar,
  TempPrecipChart,
  ThreeDotsScaleLoader,
} from "@/components";
import { PageWrapper } from "@/components/UI";
import { CELL_SIZE_OPTIONS, CLIMATE_RANGE } from "@/constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  TCitySearchRowProps,
  TClimateComparisonViewProps,
  TDiffCardProps,
  TModeToggleProps,
  TStatsGridProps,
} from "./ClimateComparison.type";
import {
  CLIMATE_COMPARISON_COLORS,
  computeCompareStats,
  computeDiffStats,
} from "./ClimateComparison.util";

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

function ModeToggle({ mode, onModeChange }: TModeToggleProps) {
  const { t } = useTranslation();

  const chipClass = (active: boolean) =>
    `cursor-pointer rounded-full px-4 py-1.5 text-[length:var(--font-sm)] font-medium transition-colors duration-150 ${
      active
        ? "bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)] border border-[var(--color-chip-active-border)]"
        : "text-[var(--color-text-secondary)] border border-transparent hover:text-[var(--color-chip-active-text)]"
    }`;

  return (
    <div className="flex justify-center">
      <div className="flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1 gap-1">
        <button
          type="button"
          className={chipClass(mode === "cities")}
          onClick={() => onModeChange("cities")}
        >
          {t("climateComparison.modeCities")}
        </button>
        <button
          type="button"
          className={chipClass(mode === "periods")}
          onClick={() => onModeChange("periods")}
        >
          {t("climateComparison.modePeriods")}
        </button>
      </div>
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

export function ClimateComparisonView({
  comparisonMode,
  cityA,
  cityB,
  periodA,
  periodB,
  dataA,
  dataB,
  autoGrid,
  isLoading,
  error,
  onComparisonModeChange,
  onCityASelect,
  onCityBSelect,
  onPeriodAChange,
  onPeriodBChange,
}: TClimateComparisonViewProps) {
  const { t } = useTranslation();
  const [activeCity, setActiveCity] = useState(0);

  const hasBothData = dataA.length > 0 && dataB.length > 0;
  const statsA = hasBothData ? computeCompareStats(dataA) : null;
  const statsB = hasBothData ? computeCompareStats(dataB) : null;
  const diff = hasBothData ? computeDiffStats(dataA, dataB) : null;

  const labelA =
    comparisonMode === "cities" ? cityA.label : `${periodA}–${periodA + CLIMATE_RANGE.WINDOW}`;
  const labelB =
    comparisonMode === "cities" ? cityB.label : `${periodB}–${periodB + CLIMATE_RANGE.WINDOW}`;

  const miniMapLocations: TMiniMapLocation[] =
    comparisonMode === "cities"
      ? [
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
        ]
      : [
          {
            lat: cityA.lat,
            lng: cityA.lng,
            label: cityA.label,
            color: CLIMATE_COMPARISON_COLORS.A.tmax,
          },
        ];

  return (
    <PageWrapper>
      <div className="flex flex-col gap-10">
        <header className="text-center">
          <h1 className="mb-2 text-[length:var(--font-xl)] lg:text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
            {t("climateComparison.title")}
          </h1>
        </header>

        <ModeToggle mode={comparisonMode} onModeChange={onComparisonModeChange} />

        <p className="text-center text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
          {t("climateComparison.autoResolution", { resolution: CELL_SIZE_OPTIONS[autoGrid] })}
        </p>

        {/* Search inputs + MiniMap card */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            {comparisonMode === "cities" && (
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
            )}

            {comparisonMode === "periods" && (
              <div className="flex flex-col gap-4">
                <CitySearchRow
                  label={t("climateComparison.searchCity")}
                  dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
                  onCitySelect={onCityASelect}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <PeriodSelectRow
                    label={t("climateComparison.periodA")}
                    dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
                    value={String(periodA)}
                    onChange={(val) => {
                      const n = parseInt(val, 10);
                      if (!isNaN(n)) onPeriodAChange(n);
                    }}
                  />
                  <PeriodSelectRow
                    label={t("climateComparison.periodB")}
                    dotColor={CLIMATE_COMPARISON_COLORS.B.tmax}
                    value={String(periodB)}
                    onChange={(val) => {
                      const n = parseInt(val, 10);
                      if (!isNaN(n)) onPeriodBChange(n);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* MiniMap card */}
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

        {/* No data prompt */}
        {!hasBothData && !isLoading && !error && (
          <p className="text-center text-[var(--color-text-secondary)]">
            {comparisonMode === "cities"
              ? t("climateComparison.noData")
              : t("climateComparison.noDataPeriods")}
          </p>
        )}

        {/* Stats table */}
        {hasBothData && statsA && statsB && (
          <StatsGrid
            labelA={labelA}
            labelB={labelB}
            statsA={statsA}
            statsB={statsB}
            activeColumn={comparisonMode === "cities" ? activeCity : undefined}
          />
        )}

        {/* Chart — uses unified TempPrecipChart with built-in toggles */}
        {hasBothData && (
          <TempPrecipChart
            dataA={dataA}
            dataB={dataB}
            labelA={labelA}
            labelB={labelB}
            compareMode={comparisonMode}
          />
        )}

        {/* Diff cards */}
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
