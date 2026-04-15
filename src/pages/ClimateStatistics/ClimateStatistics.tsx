import { CELL_SIZE_OPTIONS, CELL_SIZES, CLIMATE_START } from "@/constants";
import { useGetClimateData, usePersistedCity, useResolveCityByCoordinates } from "@/hooks";
import type { TCellSize, TCellSizeOption, TWikidataCity } from "@/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { formatCoordinate, toCityQueryParam } from "./ClimateStatistics.util";
import { ClimateStatisticsView } from "./ClimateStatisticsView";

export function ClimateStatistics() {
  const { t } = useTranslation();
  const [periodStart, setPeriodStart] = useState(CLIMATE_START);
  const [cellSize, setCellSize] = useState<TCellSize>(CELL_SIZES.TEN_MINUTES);
  const { city: selectedCity, selectCity } = usePersistedCity();
  const { isLoading: isResolving, mutateAsync: resolveCityByCoordinates } =
    useResolveCityByCoordinates();
  const latestMapClickIdRef = useRef(0);
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

  async function resolveClickedLocation(lat: number, lng: number) {
    const currentMapClickId = latestMapClickIdRef.current + 1;
    latestMapClickIdRef.current = currentMapClickId;

    const latLabel = formatCoordinate(lat);
    const lngLabel = formatCoordinate(lng);

    const provisionalCity: TWikidataCity = {
      id: `map:${latLabel},${lngLabel}`,
      label: t("map.pointLabel", { lat: latLabel, lng: lngLabel }),
      description: t("map.selectedFromMap"),
      lat,
      lng,
    };

    // * update coordinates immediately so climate fetch starts without waiting for Wikidata
    selectCity(provisionalCity);

    try {
      const resolvedCity = await resolveCityByCoordinates({ lat, lng });
      if (!resolvedCity || latestMapClickIdRef.current !== currentMapClickId) {
        return;
      }

      selectCity({
        ...resolvedCity,
        lat,
        lng,
      });
    } catch {
      // * keep provisional map label if reverse lookup fails.
    }
  }

  function handleMapClick(lat: number, lng: number) {
    void resolveClickedLocation(lat, lng);
  }

  const {
    data: temperatureData = [],
    isLoading,
    isFetching,
    isError,
  } = useGetClimateData(selectedCity.lat, selectedCity.lng, cellSize, periodStart);

  const cellSizeOptions: readonly TCellSizeOption[] = Object.entries(CELL_SIZE_OPTIONS).map(
    ([value]) => ({
      value: value as TCellSize,
      label: t(`cellSizes.${value}`),
    }),
  );

  return (
    <ClimateStatisticsView
      selectedCity={selectedCity}
      mapCenter={{ lat: selectedCity.lat, lng: selectedCity.lng }}
      cellSize={cellSize}
      cellSizeOptions={cellSizeOptions}
      temperatureData={temperatureData}
      periodStart={periodStart}
      isLoading={isLoading}
      isFetching={isFetching || isResolving}
      error={isError ? t("errors.fetchClimateData") : null}
      onCitySelect={handleCitySelect}
      onMapClick={handleMapClick}
      onCellSizeChange={setCellSize}
      onPeriodChange={setPeriodStart}
    />
  );
}
