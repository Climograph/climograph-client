import type { TMiniMapLocation } from "@/components";
import {
  CompareStatsGrid,
  DiffCard,
  LocationSearch,
  MiniMap,
  MultiPeriodStatsTable,
  TempPrecipChart,
  ThreeDotsScaleLoader,
  YearInput,
} from "@/components";
import { Dropdown, ExportMenu, PageWrapper } from "@/components/UI";
import {
  CELL_SIZE_OPTIONS,
  CLIMATE_PERIOD_LABELS,
  CLIMATE_PERIODS,
  DATASETS,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
} from "@/constants";
import { CLIMATE_COMPARISON_COLORS } from "@/pages/ClimateComparison/ClimateComparison.constant";
import { computeCompareStats } from "@/pages/ClimateComparison/ClimateComparison.util";
import type { TClimatePeriod } from "@/types";
import { buildFilename, exportElementToPng, exportTableToCsv, getMartonneBadge } from "@/utils";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MAX_PERIODS, MIN_PERIODS, PERIOD_COLORS } from "./ComparePeriods.constant";
import type { TClimatePeriodRowProps, TComparePeriodsViewProps } from "./ComparePeriods.type";

const CLIMATE_PERIOD_OPTIONS = Object.values(CLIMATE_PERIODS).map((period) => ({
  value: period,
  label: CLIMATE_PERIOD_LABELS[period],
}));

function ClimatePeriodRow({ label, dotColor, value, onChange }: TClimatePeriodRowProps) {
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
      <Dropdown
        options={CLIMATE_PERIOD_OPTIONS}
        value={value}
        onChange={(v) => {
          const period = Object.values(CLIMATE_PERIODS).find((p) => p === v);
          if (period) onChange(period as TClimatePeriod);
        }}
      />
    </div>
  );
}

export function ComparePeriodsView({
  city,
  dataset,
  climatePeriodA,
  climatePeriodB,
  dataA,
  dataB,
  autoGrid,
  selectedMonths,
  altitude,
  isLoading,
  isLocating,
  error,
  locationError,
  onCitySelect,
  onLocate,
  onClearLocationError,
  onClimatePeriodAChange,
  onClimatePeriodBChange,
  periods,
  hiddenPeriods,
  periodsData,
  loadingPeriods,
  onAddPeriod,
  onRemovePeriod,
  onToggleHidePeriod,
}: TComparePeriodsViewProps) {
  const { t } = useTranslation();
  const [addYearValue, setAddYearValue] = useState<number | undefined>(undefined);
  const [addInputError, setAddInputError] = useState<string | null>(null);
  const climateExportRef = useRef<HTMLDivElement>(null);
  const weatherExportRef = useRef<HTMLDivElement>(null);

  const isClimate = dataset === DATASETS.CLIMATE;

  const labelA = isClimate ? CLIMATE_PERIOD_LABELS[climatePeriodA] : String(periods[0] ?? "");
  const labelB = isClimate ? CLIMATE_PERIOD_LABELS[climatePeriodB] : String(periods[1] ?? "");

  const hasBothClimateData = dataA.length > 0 && dataB.length > 0;
  const statsA = hasBothClimateData ? computeCompareStats(dataA) : null;
  const statsB = hasBothClimateData ? computeCompareStats(dataB) : null;
  const tmaxDiff = statsA && statsB ? statsB.avgTmax - statsA.avgTmax : null;
  const precDiff = statsA && statsB ? statsB.totalPrec - statsA.totalPrec : null;

  const miniMapLocations: TMiniMapLocation[] = [
    { lat: city.lat, lng: city.lng, label: city.label, color: CLIMATE_COMPARISON_COLORS.A.tmax },
  ];

  function handleAddYear() {
    if (
      addYearValue === undefined ||
      isNaN(addYearValue) ||
      addYearValue < WEATHER_MIN_YEAR ||
      addYearValue > WEATHER_MAX_YEAR
    ) {
      setAddInputError(
        t("comparePeriods.weather.invalidYear", { min: WEATHER_MIN_YEAR, max: WEATHER_MAX_YEAR }),
      );
      return;
    }
    if (periods.includes(addYearValue)) {
      setAddInputError(t("comparePeriods.weather.duplicateYear"));
      return;
    }
    setAddInputError(null);
    onAddPeriod(addYearValue);
    setAddYearValue(undefined);
  }

  // ── Climate export ───────────────────────────────────────────────────────

  function handleClimateExportCSV() {
    if (!statsA || !statsB) return;
    const badgeA = getMartonneBadge(statsA.martonneIndex);
    const badgeB = getMartonneBadge(statsB.martonneIndex);
    const rows: string[][] = [
      [
        t("climateComparison.stats.avgTmax"),
        `${statsA.avgTmax.toFixed(1)} °C`,
        `${statsB.avgTmax.toFixed(1)} °C`,
      ],
      [
        t("climateComparison.stats.avgTmin"),
        `${statsA.avgTmin.toFixed(1)} °C`,
        `${statsB.avgTmin.toFixed(1)} °C`,
      ],
      [
        t("climateComparison.stats.totalPrec"),
        `${statsA.totalPrec.toFixed(0)} mm`,
        `${statsB.totalPrec.toFixed(0)} mm`,
      ],
      [
        t("climateComparison.stats.aridMonths"),
        String(statsA.aridMonths),
        String(statsB.aridMonths),
      ],
    ];
    if (altitude != null) {
      rows.push([t("chart.altitude"), `${altitude} m`, `${altitude} m`]);
    }
    rows.push([
      t("climateComparison.stats.martonne"),
      statsA.martonneIndex !== null
        ? `${statsA.martonneIndex.toFixed(1)} (${badgeA?.labelKey ?? ""})`
        : "—",
      statsB.martonneIndex !== null
        ? `${statsB.martonneIndex.toFixed(1)} (${badgeB?.labelKey ?? ""})`
        : "—",
    ]);
    exportTableToCsv(
      buildFilename("compare-periods", [city.label, labelA, labelB], "csv"),
      [t("exportMenu.metricColumn"), labelA, labelB],
      rows,
    );
  }

  async function handleClimateExportPNG() {
    if (!climateExportRef.current) return;
    await exportElementToPng(
      climateExportRef.current,
      buildFilename("compare-periods", [city.label, labelA, labelB], "png"),
    );
  }

  // ── Weather export ───────────────────────────────────────────────────────

  function handleWeatherExportCSV() {
    const statsMap = new Map(
      periodsData.map(({ year, rows }) => [year, computeCompareStats(rows)]),
    );
    const metricLabels = [
      t("climateComparison.stats.avgTmax"),
      t("climateComparison.stats.avgTmin"),
      t("climateComparison.stats.totalPrec"),
      t("climateComparison.stats.aridMonths"),
    ];
    const metricFormats: ((s: ReturnType<typeof computeCompareStats>) => string)[] = [
      (s) => `${s.avgTmax.toFixed(1)} °C`,
      (s) => `${s.avgTmin.toFixed(1)} °C`,
      (s) => `${s.totalPrec.toFixed(0)} mm`,
      (s) => String(s.aridMonths),
    ];
    const rows: string[][] = metricLabels.map((label, i) => [
      label,
      ...periods.map((year) => {
        const s = statsMap.get(year);
        return s !== undefined ? (metricFormats[i]?.(s) ?? "—") : "—";
      }),
    ]);
    if (altitude !== null) {
      rows.push([t("chart.altitude"), ...periods.map(() => `${altitude} m`)]);
    }
    rows.push([
      t("climateComparison.stats.martonne"),
      ...periods.map((year) => {
        const s = statsMap.get(year);
        return s !== undefined && s.martonneIndex !== null ? s.martonneIndex.toFixed(1) : "—";
      }),
    ]);
    exportTableToCsv(
      buildFilename("compare-periods", [city.label, ...periods.map(String)], "csv"),
      [t("exportMenu.metricColumn"), ...periods.map(String)],
      rows,
    );
  }

  async function handleWeatherExportPNG() {
    if (!weatherExportRef.current) return;
    await exportElementToPng(
      weatherExportRef.current,
      buildFilename("compare-periods", [city.label, ...periods.map(String)], "png"),
    );
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-10">
        <header className="text-center">
          <h1 className="mb-2 text-[length:var(--font-xl)] lg:text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
            {t("comparePeriods.title")}
          </h1>
        </header>

        <p className="text-center text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
          {t("climateComparison.autoResolution", { resolution: CELL_SIZE_OPTIONS[autoGrid] })}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: CLIMATE_COMPARISON_COLORS.A.tmax }}
                  aria-hidden="true"
                />
                <span className="text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)]">
                  {t("climateComparison.searchCity")}
                </span>
              </div>
              <LocationSearch
                key={city.id}
                defaultValue={city.label}
                isLocating={isLocating}
                locationError={locationError}
                onCitySelect={onCitySelect}
                onLocate={onLocate}
                onClearLocationError={onClearLocationError}
              />
            </div>

            {isClimate ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ClimatePeriodRow
                  label={t("climateComparison.periodA")}
                  dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
                  value={climatePeriodA}
                  onChange={onClimatePeriodAChange}
                />
                <ClimatePeriodRow
                  label={t("climateComparison.periodB")}
                  dotColor={CLIMATE_COMPARISON_COLORS.B.tmax}
                  value={climatePeriodB}
                  onChange={onClimatePeriodBChange}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)]">
                  {t("comparePeriods.weather.periods")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {periods.map((year, i) => {
                    const color = PERIOD_COLORS[i] ?? PERIOD_COLORS[0];
                    const isHidden = hiddenPeriods.includes(year);
                    return (
                      <span
                        key={year}
                        className="inline-flex items-center gap-1.5 rounded-[20px] border-l-2 bg-[var(--color-bg-secondary)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text)] cursor-pointer select-none"
                        style={{ borderLeftColor: color, opacity: isHidden ? 0.45 : 1 }}
                        onClick={() => onToggleHidePeriod(year)}
                      >
                        <span style={{ color }}>●</span>
                        {year}
                        {periods.length > MIN_PERIODS && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemovePeriod(year);
                            }}
                            className="ml-0.5 opacity-60 hover:opacity-100 leading-none text-[var(--color-text-secondary)]"
                            aria-label={t("comparePeriods.weather.removePeriod", { year })}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-full max-w-[200px]">
                    <YearInput
                      value={addYearValue}
                      min={WEATHER_MIN_YEAR}
                      max={WEATHER_MAX_YEAR}
                      onChange={(year) => {
                        setAddYearValue(year);
                        setAddInputError(null);
                      }}
                      onEnter={handleAddYear}
                      placeholder={`${WEATHER_MIN_YEAR}–${WEATHER_MAX_YEAR}`}
                      disabled={periods.length >= MAX_PERIODS}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddYear}
                    disabled={periods.length >= MAX_PERIODS}
                    className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-[length:var(--font-base)] font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("comparePeriods.weather.addPeriod")}
                  </button>
                </div>
                <p className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
                  {t("comparePeriods.weather.periodsCount", {
                    count: periods.length,
                    max: MAX_PERIODS,
                  })}
                </p>
                {addInputError && (
                  <p className="text-[length:var(--font-xs)] text-[var(--color-error)]">
                    {addInputError}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="h-[120px] w-full shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm sm:h-[160px] sm:w-[260px]">
            <MiniMap locations={miniMapLocations} activeIndex={0} onToggle={() => undefined} />
          </div>
        </div>

        {isLoading && isClimate && (
          <div className="flex flex-col items-center gap-3 py-12">
            <ThreeDotsScaleLoader className="text-[var(--color-primary)]" size={80} />
          </div>
        )}

        {error && !isLoading && (
          <div className="px-4 py-3 text-center text-[var(--color-error)] bg-[var(--color-error-bg)] rounded-[var(--radius-md)] border border-[var(--color-error-border)]">
            {error.message}
          </div>
        )}

        {/* ── Climate: 2-period comparison ── */}
        {isClimate && !hasBothClimateData && !isLoading && !error && (
          <p className="text-center text-[var(--color-text-secondary)]">
            {t("climateComparison.noDataPeriods")}
          </p>
        )}

        {isClimate && hasBothClimateData && statsA && statsB && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-end">
              <ExportMenu
                onExportCSV={handleClimateExportCSV}
                onExportPNG={handleClimateExportPNG}
              />
            </div>
            <div ref={climateExportRef} className="flex flex-col gap-6">
              <CompareStatsGrid
                labelA={labelA}
                labelB={labelB}
                statsA={statsA}
                statsB={statsB}
                altitudeA={altitude}
                altitudeB={altitude}
              />
              <TempPrecipChart
                dataA={dataA}
                dataB={dataB}
                labelA={labelA}
                labelB={labelB}
                compareMode="periods"
                cityName={city.label}
                subtitle={{ rawLabel: `${labelA} vs ${labelB}` }}
                showWalterLiethToggle={false}
                showAridity={false}
                {...(selectedMonths !== null && selectedMonths.length > 0
                  ? { selectedMonths }
                  : {})}
              />
            </div>
          </div>
        )}

        {isClimate && hasBothClimateData && tmaxDiff !== null && precDiff !== null && (
          <div className="grid grid-cols-2 gap-3">
            <DiffCard
              title={t("comparePeriods.trend.tempTitle")}
              value={
                tmaxDiff === 0
                  ? t("comparePeriods.trend.noChange")
                  : `${tmaxDiff > 0 ? "+" : ""}${tmaxDiff.toFixed(1)}°C`
              }
              sub={`${labelB} vs ${labelA}`}
              valueColor={
                tmaxDiff > 0
                  ? CLIMATE_COMPARISON_COLORS.B.tmax
                  : tmaxDiff < 0
                    ? CLIMATE_COMPARISON_COLORS.A.tmax
                    : undefined
              }
            />
            <DiffCard
              title={t("comparePeriods.trend.precipTitle")}
              value={
                precDiff === 0
                  ? t("comparePeriods.trend.noChange")
                  : `${precDiff > 0 ? "+" : ""}${precDiff.toFixed(0)} mm`
              }
              sub={`${labelB} vs ${labelA}`}
              valueColor={
                precDiff > 0
                  ? CLIMATE_COMPARISON_COLORS.B.tmax
                  : precDiff < 0
                    ? CLIMATE_COMPARISON_COLORS.A.tmax
                    : undefined
              }
            />
          </div>
        )}

        {/* ── Weather: multi-period ── */}
        {!isClimate && periods.length > 0 && (
          <div className="flex flex-col gap-2">
            {periodsData.length > 0 && (
              <div className="flex justify-end">
                <ExportMenu
                  onExportCSV={handleWeatherExportCSV}
                  onExportPNG={handleWeatherExportPNG}
                />
              </div>
            )}
            <div ref={weatherExportRef} className="flex flex-col gap-6">
              <MultiPeriodStatsTable
                periods={periods}
                periodsData={periodsData}
                loadingPeriods={loadingPeriods}
                altitude={altitude}
                periodColors={PERIOD_COLORS}
              />
              {periodsData.length > 0 && (
                <TempPrecipChart
                  cityName={city.label}
                  multiPeriodData={periodsData}
                  hiddenPeriods={hiddenPeriods}
                  periodColors={PERIOD_COLORS}
                  showWalterLiethToggle={false}
                  showAridity={false}
                  {...(selectedMonths !== null && selectedMonths.length > 0
                    ? { selectedMonths }
                    : {})}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
