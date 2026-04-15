import {
  CellSizeSelector,
  FiltersTab,
  LeafletMap,
  PeriodSlider,
  SearchBar,
  TempPrecipChart,
  ThreeDotsScaleLoader,
} from "@/components";
import { FilterChip } from "@/components/FilterChip";
import { CLIMATE_RANGE } from "@/constants";
import { useTranslation } from "react-i18next";
import type { TClimateStatisticsViewProps } from "./ClimateStatistics.type";

export function ClimateStatisticsView({
  selectedCity,
  mapCenter,
  cellSize,
  cellSizeOptions,
  temperatureData,
  periodStart,
  isLoading,
  isFetching,
  error,
  onCitySelect,
  onMapClick,
  onCellSizeChange,
  onPeriodChange,
}: TClimateStatisticsViewProps) {
  const { t } = useTranslation();

  const activeCell = cellSizeOptions.find((o) => o.value === cellSize);
  const periodEnd = Math.min(periodStart + CLIMATE_RANGE.WINDOW, CLIMATE_RANGE.MAX_START);

  const filterSummary = (
    <>
      {activeCell && <FilterChip label={activeCell.label} />}
      <FilterChip label={`${periodStart} – ${periodEnd}`} />
    </>
  );

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-[960px] flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-[length:var(--font-xl)] lg:text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
            {t("climateStatistics.title")}
          </h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            {t("climateStatistics.subtitle")}
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <div className="flex justify-center">
            <SearchBar onCitySelect={onCitySelect} />
          </div>

          <FiltersTab summary={filterSummary}>
            <>
              <CellSizeSelector
                activeSize={cellSize}
                options={cellSizeOptions}
                onSelect={onCellSizeChange}
              />
              <PeriodSlider startYear={periodStart} onChange={onPeriodChange} />
            </>
          </FiltersTab>
        </section>

        <section>
          <LeafletMap
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            onMapClick={onMapClick}
            {...(selectedCity ? { label: selectedCity.label } : {})}
          />
        </section>

        {error && (
          <div
            className={`
              text-center px-4 py-3
              text-[var(--color-error)] 
              bg-[var(--color-error-bg)] 
              rounded-[var(--radius-md)] border border-[var(--color-error-border)]
            `}
          >
            <p>{error}</p>
          </div>
        )}

        {(temperatureData.length > 0 || isLoading || isFetching) && selectedCity && (
          <section className="relative">
            {(isLoading || isFetching) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-bg)]/80 backdrop-blur-sm">
                <ThreeDotsScaleLoader className="text-[var(--color-primary)]" size={80} />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {isLoading ? t("loading.fetchingClimateData") : t("loading.updating")}
                </p>
              </div>
            )}
            <TempPrecipChart data={temperatureData} cityName={selectedCity.label} />
          </section>
        )}
      </div>
    </div>
  );
}
