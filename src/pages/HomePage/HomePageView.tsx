import { CellSizeSelector, LeafletMap, SearchBar, TemperatureChart } from "@/components";
import type { THomePageViewProps } from "./HomePage.type";

export function HomePageView({
  selectedCity,
  mapCenter,
  cellSize,
  cellSizeOptions,
  temperatureData,
  isLoading,
  error,
  onCitySelect,
  onCellSizeChange,
}: THomePageViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[960px] flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
            Climograph
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
            {...(selectedCity ? { label: selectedCity.label } : {})}
          />
        </section>

        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-[var(--color-text-secondary)]">
            <div
              className={`
              w-8 h-8 
              border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] 
              rounded-[var(--radius-full)] animate-spin
            `}
            />
            <p>Fetching climate data...</p>
          </div>
        )}

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

        {temperatureData.length > 0 && selectedCity && (
          <section>
            <TemperatureChart data={temperatureData} cityName={selectedCity.label} />
          </section>
        )}
      </div>
    </div>
  );
}
