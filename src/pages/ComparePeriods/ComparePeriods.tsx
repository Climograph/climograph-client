import { CLIMATE_PERIODS, WEATHER_MAX_YEAR, WEATHER_MIN_YEAR } from "@/constants";
import type { TClimatePeriod } from "@/constants/worldclim.constant";
import {
  useGeolocation,
  useGetAltitude,
  useGetComparePeriods,
  usePersistedComparisonCities,
} from "@/hooks";
import { useFiltersStore } from "@/stores";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ComparePeriodsView } from "./ComparePeriodsView";

export function ComparePeriods() {
  const { t } = useTranslation();
  const { cityA, selectCityA } = usePersistedComparisonCities();
  const { gridSize, dataset, months } = useFiltersStore();
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();
  const selectedMonths = Array.isArray(months) ? months : null;

  const [climatePeriodA, setClimatePeriodA] = useState<TClimatePeriod>(CLIMATE_PERIODS.C1970_2000);
  const [climatePeriodB, setClimatePeriodB] = useState<TClimatePeriod>(CLIMATE_PERIODS.C1991_2020);
  const [yearA, setYearA] = useState<number>(WEATHER_MIN_YEAR);
  const [yearB, setYearB] = useState<number>(WEATHER_MAX_YEAR);

  const { dataA, dataB, isLoading, error } = useGetComparePeriods(
    cityA.lat,
    cityA.lng,
    climatePeriodA,
    climatePeriodB,
    yearA,
    yearB,
    gridSize,
    dataset,
  );

  const { data: altitude = null } = useGetAltitude(cityA.lat, cityA.lng, gridSize);

  function handleLocate() {
    locate(selectCityA);
  }

  const resolvedLocationError = locationError !== null ? t(locationError) : null;

  return (
    <ComparePeriodsView
      city={cityA}
      altitude={altitude}
      dataset={dataset}
      climatePeriodA={climatePeriodA}
      climatePeriodB={climatePeriodB}
      yearA={yearA}
      yearB={yearB}
      dataA={dataA}
      dataB={dataB}
      autoGrid={gridSize}
      selectedMonths={selectedMonths}
      isLoading={isLoading}
      isLocating={isLocating}
      error={error}
      locationError={resolvedLocationError}
      onCitySelect={selectCityA}
      onLocate={handleLocate}
      onClearLocationError={clearLocationError}
      onClimatePeriodAChange={setClimatePeriodA}
      onClimatePeriodBChange={setClimatePeriodB}
      onYearAChange={setYearA}
      onYearBChange={setYearB}
    />
  );
}
