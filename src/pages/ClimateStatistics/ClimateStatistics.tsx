import { CELL_SIZE_OPTIONS, CELL_SIZES } from "@/constants";
import { useGetClimateData, usePersistedCity } from "@/hooks";
import type { TCellSize, TCellSizeOption, TWikidataCity } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClimateStatisticsView } from "./ClimateStatisticsView";

function toCityQueryParam(cityLabel: string) {
  return cityLabel.trim().toLowerCase();
}

export function ClimateStatistics() {
  const [cellSize, setCellSize] = useState<TCellSize>(CELL_SIZES.TEN_MINUTES);
  const { city: selectedCity, selectCity } = usePersistedCity();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCityInUrl = useMemo(
    () => toCityQueryParam(selectedCity.label),
    [selectedCity.label],
  );

  useEffect(() => {
    if (searchParams.get("city") === selectedCityInUrl) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("city", selectedCityInUrl);
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, selectedCityInUrl, setSearchParams]);

  function handleCitySelect(city: TWikidataCity) {
    selectCity(city);
  }

  const {
    data: temperatureData = [],
    isLoading,
    isError,
  } = useGetClimateData(selectedCity.lat, selectedCity.lng, cellSize);

  const cellSizeOptions: readonly TCellSizeOption[] = Object.entries(CELL_SIZE_OPTIONS).map(
    ([value, label]) => ({ value: value as TCellSize, label }),
  );

  return (
    <ClimateStatisticsView
      selectedCity={selectedCity}
      mapCenter={{ lat: selectedCity.lat, lng: selectedCity.lng }}
      cellSize={cellSize}
      cellSizeOptions={cellSizeOptions}
      temperatureData={temperatureData}
      isLoading={isLoading}
      error={isError ? "Failed to fetch climate data" : null}
      onCitySelect={handleCitySelect}
      onCellSizeChange={setCellSize}
    />
  );
}
