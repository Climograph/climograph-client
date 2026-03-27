import { CELL_SIZE_OPTIONS, CELL_SIZES } from "@/constants";
import { useGetClimateData, usePersistedCity } from "@/hooks";
import type { TCellSize } from "@/types/domain/climate";
import type { TCellSizeOption } from "@/types/ui/cell-size";
import { useState } from "react";
import { HomePageView } from "./HomePageView";

export function HomePage() {
  const [cellSize, setCellSize] = useState<TCellSize>(CELL_SIZES.TEN_MINUTES);
  const { city: selectedCity, selectCity } = usePersistedCity();

  const {
    data: temperatureData = [],
    isLoading,
    isError,
  } = useGetClimateData(selectedCity.lat, selectedCity.lng, cellSize);

  const cellSizeOptions: readonly TCellSizeOption[] = Object.entries(CELL_SIZE_OPTIONS).map(
    ([value, label]) => ({ value: value as TCellSize, label }),
  );

  return (
    <HomePageView
      selectedCity={selectedCity}
      mapCenter={{ lat: selectedCity.lat, lng: selectedCity.lng }}
      cellSize={cellSize}
      cellSizeOptions={cellSizeOptions}
      temperatureData={temperatureData}
      isLoading={isLoading}
      error={isError ? "Failed to fetch climate data" : null}
      onCitySelect={selectCity}
      onCellSizeChange={setCellSize}
    />
  );
}
