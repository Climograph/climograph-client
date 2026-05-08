import { CLIMATE_PERIODS, WEATHER_MAX_YEAR, WEATHER_MIN_YEAR } from "@/constants";
import type { TClimatePeriod } from "@/constants/worldclim.constant";
import { useGetComparePeriods, usePersistedComparisonCities } from "@/hooks";
import { useFiltersStore } from "@/stores";
import { useState } from "react";
import { ComparePeriodsView } from "./ComparePeriodsView";

export function ComparePeriods() {
  const { cityA, selectCityA } = usePersistedComparisonCities();
  const { gridSize, dataset } = useFiltersStore();

  const [climatePeriodA, setClimatePeriodA] = useState<TClimatePeriod>(CLIMATE_PERIODS.C1970_2000);
  const [climatePeriodB, setClimatePeriodB] = useState<TClimatePeriod>(CLIMATE_PERIODS.C1991_2020);
  const [yearA, setYearA] = useState<number>(WEATHER_MIN_YEAR);
  const [yearB, setYearB] = useState<number>(WEATHER_MAX_YEAR);

  const { dataA, dataB, isLoading, error } = useGetComparePeriods(
    cityA?.lat ?? null,
    cityA?.lng ?? null,
    climatePeriodA,
    climatePeriodB,
    yearA,
    yearB,
    gridSize,
    dataset,
  );

  return (
    <ComparePeriodsView
      city={cityA}
      dataset={dataset}
      climatePeriodA={climatePeriodA}
      climatePeriodB={climatePeriodB}
      yearA={yearA}
      yearB={yearB}
      dataA={dataA}
      dataB={dataB}
      autoGrid={gridSize}
      isLoading={isLoading}
      error={error}
      onCitySelect={selectCityA}
      onClimatePeriodAChange={setClimatePeriodA}
      onClimatePeriodBChange={setClimatePeriodB}
      onYearAChange={setYearA}
      onYearBChange={setYearB}
    />
  );
}
