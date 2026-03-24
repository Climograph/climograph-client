import { WorldClimService } from "@/api";
import { CELL_SIZE_OPTIONS, CELL_SIZES, DEFAULT_MAP_CENTER } from "@/constants";
import { usePersistedCity } from "@/hooks";
import type { TCellSize, TMonthlyTemperature } from "@/types/domain/climate";
import type { TWikidataCity } from "@/types/domain/location";
import type { TCellSizeOption } from "@/types/ui/cell-size";
import { useEffect, useState } from "react";
import { HomePageView } from "./HomePageView";

export function HomePage() {
  const [cellSize, setCellSize] = useState<TCellSize>(CELL_SIZES.TEN_MINUTES);
  const [temperatureData, setTemperatureData] = useState<TMonthlyTemperature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cellSizeOptions: TCellSizeOption[] = Object.entries(CELL_SIZE_OPTIONS).map(
    ([value, label]) => ({ value: value as TCellSize, label }),
  );

  const { city: selectedCity, selectCity } = usePersistedCity();

  useEffect(() => {
    void fetchClimateData(selectedCity.lat, selectedCity.lng, cellSize);
  }, [selectedCity, cellSize]);

  function handleCitySelect(city: TWikidataCity) {
    selectCity(city);
  }

  function handleCellSizeChange(size: TCellSize) {
    setCellSize(size);
  }

  async function fetchClimateData(lat: number, lng: number, size: TCellSize) {
    setIsLoading(true);
    setError(null);
    setTemperatureData([]);

    try {
      const cellsResponse = await WorldClimService.getCellsForPoint(lat, lng);
      const cellId = WorldClimService.extractCellBySize(cellsResponse, size);

      if (!cellId) {
        setError(`No cell data found for size "${size}" at this location.`);
        return;
      }

      const temps = await WorldClimService.getMonthlyTemperatures(lat, lng, size);
      setTemperatureData(temps);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch climate data";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handlePageCitySelect(city: TWikidataCity) {
    void handleCitySelect(city);
  }

  function handlePageCellSizeChange(size: TCellSize) {
    void handleCellSizeChange(size);
  }

  return (
    <HomePageView
      selectedCity={selectedCity}
      mapCenter={
        selectedCity ? { lat: selectedCity.lat, lng: selectedCity.lng } : DEFAULT_MAP_CENTER
      }
      cellSize={cellSize}
      cellSizeOptions={cellSizeOptions}
      temperatureData={temperatureData}
      isLoading={isLoading}
      error={error}
      onCitySelect={handlePageCitySelect}
      onCellSizeChange={handlePageCellSizeChange}
    />
  );
}
