import { CLIMATE_START, DATASETS } from "@/constants";
import {
  useGeolocation,
  useGetClimateData,
  usePersistedCity,
  useResolveCityByCoordinates,
} from "@/hooks";
import { useFiltersStore } from "@/stores";
import type { TWikidataCity } from "@/types";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { formatCoordinate, toCityQueryParam } from "./ClimateStatistics.util";
import { ClimateStatisticsView } from "./ClimateStatisticsView";

export function ClimateStatistics() {
  const { t } = useTranslation();
  const { city: selectedCity, selectCity } = usePersistedCity();
  const { isLoading: isResolving, mutateAsync: resolveCityByCoordinates } =
    useResolveCityByCoordinates();
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();
  const latestMapClickIdRef = useRef(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const { dataset, periodStart: storePeriodStart, gridSize, months } = useFiltersStore();
  const isClimate = dataset === DATASETS.CLIMATE;
  const effectivePeriodStart = isClimate ? CLIMATE_START : storePeriodStart;
  const selectedMonths: number[] | null = Array.isArray(months) ? months : null;

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
    selectCity(city);
  }

  function handleLocate() {
    locate((city) => selectCity(city));
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
  } = useGetClimateData(selectedCity.lat, selectedCity.lng, gridSize, effectivePeriodStart);

  const resolvedLocationError =
    locationError === "denied"
      ? t("errors.geolocationDenied")
      : locationError === "unavailable"
        ? t("errors.geolocationUnavailable")
        : null;

  return (
    <ClimateStatisticsView
      selectedCity={selectedCity}
      mapCenter={{ lat: selectedCity.lat, lng: selectedCity.lng }}
      temperatureData={temperatureData}
      cellSize={gridSize}
      isAutoResolution={false}
      selectedMonths={selectedMonths}
      isLoading={isLoading}
      isFetching={isFetching || isResolving}
      isLocating={isLocating}
      error={isError ? t("errors.fetchClimateData") : null}
      locationError={resolvedLocationError}
      onCitySelect={handleCitySelect}
      onMapClick={handleMapClick}
      onLocate={handleLocate}
    />
  );
}
