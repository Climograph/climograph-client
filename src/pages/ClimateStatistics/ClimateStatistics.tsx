import type { TChartSubtitle } from "@/components/TempPrecipChart/TempPrecipChart.type";
import { DATASETS } from "@/constants";
import {
  useGeolocation,
  useGetAltitude,
  useGetCellBounds,
  useGetClimateData,
  usePersistedCity,
  useResolveCityByCoordinates,
} from "@/hooks";
import { useFiltersStore } from "@/stores";
import type { TWikidataCity } from "@/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { formatCoordinate, toCityQueryParam } from "./ClimateStatistics.util";
import { ClimateStatisticsView } from "./ClimateStatisticsView";

function resolveCityName(city: TWikidataCity): string {
  return /^Q\d+$/.test(city.label) ? city.description : city.label;
}

export function ClimateStatistics() {
  const { t } = useTranslation();
  const { city: selectedCity, selectCity } = usePersistedCity();
  const { isLoading: isResolving, mutateAsync: resolveCityByCoordinates } =
    useResolveCityByCoordinates();
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();
  const latestMapClickIdRef = useRef(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const { dataset, climatePeriod, weatherYear, gridSize, months, variables } = useFiltersStore();
  const selectedMonths: number[] | null = Array.isArray(months) ? months : null;

  const [chartCityName, setChartCityName] = useState<string>(() => resolveCityName(selectedCity));

  const subtitle: TChartSubtitle =
    dataset === DATASETS.CLIMATE
      ? { dataset: DATASETS.CLIMATE, climatePeriod }
      : { dataset: DATASETS.WEATHER, weatherYear };

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
    clearLocationError();
    const name = resolveCityName(city);
    if (name) setChartCityName(name);
    selectCity(city);
  }

  function handleLocate() {
    locate((city) => {
      const name = resolveCityName(city);
      if (name) setChartCityName(name);
      selectCity(city);
    });
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

    /** update coordinates immediately so climate fetch starts without waiting for Wikidata */
    selectCity(provisionalCity);

    try {
      const resolvedCity = await resolveCityByCoordinates({ lat, lng });
      if (!resolvedCity || latestMapClickIdRef.current !== currentMapClickId) {
        return;
      }

      const name = resolveCityName(resolvedCity);
      if (name) setChartCityName(name);

      selectCity({
        ...resolvedCity,
        lat,
        lng,
      });
    } catch {
      /** keep provisional map label if reverse lookup fails */
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
  } = useGetClimateData(selectedCity.lat, selectedCity.lng, gridSize);

  const { data: altitude = null } = useGetAltitude(selectedCity.lat, selectedCity.lng, gridSize);
  const { data: cellBounds = null } = useGetCellBounds(
    selectedCity.lat,
    selectedCity.lng,
    gridSize,
  );

  const resolvedLocationError = locationError !== null ? t(locationError) : null;

  return (
    <ClimateStatisticsView
      selectedCity={selectedCity}
      mapCenter={{ lat: selectedCity.lat, lng: selectedCity.lng }}
      temperatureData={temperatureData}
      cityName={chartCityName}
      subtitle={subtitle}
      altitude={altitude}
      cellBounds={cellBounds}
      gridSize={gridSize}
      selectedMonths={selectedMonths}
      variables={variables}
      isLoading={isLoading}
      isFetching={isFetching || isResolving}
      isLocating={isLocating}
      error={isError ? t("errors.fetchClimateData") : null}
      locationError={resolvedLocationError}
      onCitySelect={handleCitySelect}
      onMapClick={handleMapClick}
      onLocate={handleLocate}
      onClearLocationError={clearLocationError}
    />
  );
}
