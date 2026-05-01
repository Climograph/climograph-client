import { LeafletMap, SearchBar, TempPrecipChart, ThreeDotsScaleLoader } from "@/components";
import { LocationIcon, SpinnerIcon } from "@/components/svg";
import { ExportMenu, PageWrapper } from "@/components/UI";
import { exportToCSV, exportToPNG, exportToSVG } from "@/utils";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { TClimateStatisticsViewProps, TStatCardProps } from "./ClimateStatistics.type";
import { computeClimateStats } from "./ClimateStatistics.util";

function StatCard({ label, value, unit, tooltip }: TStatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      <span className="flex items-center gap-1 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
        {label}
        {tooltip && (
          <span
            title={tooltip}
            className="cursor-help text-[var(--color-text-secondary)] opacity-60 hover:opacity-100"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-1A6 6 0 1 0 8 2a6 6 0 0 0 0 12zm-.75-4.25h1.5V11h-1.5V9.75zM8 4.5a1.75 1.75 0 0 1 1.394 2.8c-.275.352-.644.56-.894.77-.223.19-.375.394-.375.68V9h-1.25v-.25c0-.637.297-1.047.657-1.36.267-.228.562-.41.743-.645A.75.75 0 0 0 8 5.75 1 1 0 0 0 7 6.75H5.5A2.5 2.5 0 0 1 8 4.5z" />
            </svg>
          </span>
        )}
      </span>
      <span className="text-[length:var(--font-xl)] font-bold text-[var(--color-text)] leading-none">
        {value}
        {unit && (
          <span className="ml-1 text-[length:var(--font-sm)] font-normal text-[var(--color-text-secondary)]">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

export function ClimateStatisticsView({
  selectedCity,
  mapCenter,
  temperatureData,
  cellSize,
  isAutoResolution,
  selectedMonths,
  isLoading,
  isFetching,
  isLocating,
  error,
  locationError,
  onCitySelect,
  onMapClick,
  onLocate,
}: TClimateStatisticsViewProps) {
  const { t } = useTranslation();
  const chartRef = useRef<HTMLElement | null>(null);

  const isFiltered = selectedMonths !== null && selectedMonths.length > 0;
  const isSingleMonth = isFiltered && selectedMonths.length === 1;

  const showStats = temperatureData.length > 0 && !isLoading && !error;
  const stats = showStats ? computeClimateStats(temperatureData, cellSize, selectedMonths) : null;

  const filteredMonthNames = isFiltered
    ? selectedMonths
        .slice()
        .sort((a, b) => a - b)
        .map((n) => t(`months.${n}`))
        .join(", ")
    : null;

  // * fall back to description if wikidata returned an entity ID as the label
  const chartCityName = selectedCity
    ? /^Q\d+$/.test(selectedCity.label)
      ? selectedCity.description
      : selectedCity.label
    : "";

  function handleExportCSV() {
    exportToCSV(temperatureData, chartCityName);
  }

  function handleExportPNG() {
    void exportToPNG("climate-stats-container", `climatica-${chartCityName}`);
  }

  function handleExportSVG() {
    exportToSVG(chartRef, `climatica-${chartCityName}`);
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-10">
        <header className="text-center">
          <h1 className="mb-2 text-[length:var(--font-xl)] lg:text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
            {t("climateStatistics.title")}
          </h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            {t("climateStatistics.subtitle")}
          </p>
        </header>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchBar onCitySelect={onCitySelect} />
            </div>
            <button
              type="button"
              onClick={onLocate}
              disabled={isLocating}
              aria-label={t("climateStatistics.useMyLocation")}
              className={`
                flex h-10 shrink-0 items-center gap-1.5 px-3
                rounded-[var(--radius-sm)]
                border border-[var(--color-border)] bg-[var(--color-bg)]
                text-[length:var(--font-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]
                transition-colors duration-150 hover:bg-[var(--color-bg-secondary)]
                disabled:cursor-not-allowed disabled:opacity-60
              `}
            >
              {isLocating ? <SpinnerIcon /> : <LocationIcon />}
              <span className="hidden sm:inline">
                {isLocating
                  ? t("climateStatistics.locating")
                  : t("climateStatistics.useMyLocation")}
              </span>
            </button>
          </div>

          {locationError && (
            <p className="text-[length:var(--font-sm)] text-[var(--color-error)]">
              {locationError}
            </p>
          )}
        </div>

        <section>
          <LeafletMap
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            onMapClick={onMapClick}
            {...(selectedCity ? { label: selectedCity.label } : {})}
          />
        </section>

        {error && (
          <div className="text-center px-4 py-3 text-[var(--color-error)] bg-[var(--color-error-bg)] rounded-[var(--radius-md)] border border-[var(--color-error-border)]">
            <p>{error}</p>
          </div>
        )}

        {selectedCity && (temperatureData.length > 0 || isLoading || isFetching) && (
          <div id="climate-stats-container" className="flex flex-col gap-8">
            {stats && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatCard
                    label={
                      isSingleMonth
                        ? t("climateStatistics.stats.tmax")
                        : t("climateStatistics.stats.avgTmax")
                    }
                    value={stats.avgTmax}
                    unit="°C"
                  />
                  <StatCard
                    label={
                      isSingleMonth
                        ? t("climateStatistics.stats.tmin")
                        : t("climateStatistics.stats.avgTmin")
                    }
                    value={stats.avgTmin}
                    unit="°C"
                  />
                  <StatCard
                    label={t("climateStatistics.stats.totalPrec")}
                    value={stats.totalPrec}
                    unit={isSingleMonth ? t("climateStatistics.stats.mmThisMonth") : "mm"}
                  />
                  <StatCard
                    label={t("climateStatistics.stats.resolution")}
                    value={stats.resolution}
                    {...(isAutoResolution
                      ? { tooltip: t("climateStatistics.stats.autoResolutionTooltip") }
                      : {})}
                  />
                </div>
                {filteredMonthNames && (
                  <p className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
                    {t("climateStatistics.stats.filteredMonths", { months: filteredMonthNames })}
                  </p>
                )}
              </div>
            )}

            <div id="climate-chart-container" className="flex flex-col gap-2">
              <div className="flex justify-end">
                <ExportMenu
                  onExportCSV={handleExportCSV}
                  onExportPNG={handleExportPNG}
                  onExportSVG={handleExportSVG}
                  isDisabled={temperatureData.length === 0}
                />
              </div>
              <section
                ref={(el) => {
                  chartRef.current = el;
                }}
                className="relative"
              >
                {(isLoading || isFetching) && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-bg)]/80 backdrop-blur-sm">
                    <ThreeDotsScaleLoader className="text-[var(--color-primary)]" size={80} />
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {isLoading ? t("loading.fetchingClimateData") : t("loading.updating")}
                    </p>
                  </div>
                )}
                <TempPrecipChart
                  data={temperatureData}
                  cityName={chartCityName}
                  {...(isFiltered ? { selectedMonths } : {})}
                />
              </section>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
