import {
  CellSizeSelector,
  LeafletMap,
  SearchBar,
  TemperatureChart,
  ThreeDotsScaleLoader,
} from "@/components";
import type { TClimateStatisticsViewProps } from "./ClimateStatistics.type";

export function ClimateStatisticsView({
  selectedCity,
  mapCenter,
  cellSize,
  cellSizeOptions,
  temperatureData,
  isLoading,
  isFetching,
  error,
  onCitySelect,
  onMapClick,
  onCellSizeChange,
}: TClimateStatisticsViewProps) {
  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-[960px] flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-[length:var(--font-xl)] lg:text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
            Climate Statistics
          </h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            Search for a city to explore its climate data
          </p>
        </header>

        <section className="flex justify-center">
          <SearchBar onCitySelect={onCitySelect} />
        </section>

        <section className="flex justify-center">
          <CellSizeSelector
            activeSize={cellSize}
            options={cellSizeOptions}
            onSelect={onCellSizeChange}
          />
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
                  {isLoading ? "Fetching climate data..." : "Updating..."}
                </p>
              </div>
            )}
            <TemperatureChart data={temperatureData} cityName={selectedCity.label} />
          </section>
        )}
      </div>
    </div>
  );
}
