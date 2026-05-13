import type { TChartSubtitle } from "@/components/TempPrecipChart";
import { DATASETS, SIDEBAR_PARAMS } from "@/constants";
import { useGetCompareData, usePersistedComparisonCities } from "@/hooks";
import { useFiltersStore } from "@/stores";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CompareCitiesView } from "./CompareCitiesView";

export function CompareCities() {
  const { cityA, cityB, selectCityA, selectCityB } = usePersistedComparisonCities();
  const { gridSize, dataset, climatePeriod, weatherYear, months } = useFiltersStore();
  const selectedMonths = Array.isArray(months) ? months : null;
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    let changed = false;
    if (nextParams.get(SIDEBAR_PARAMS.COMPARE_CITY_A) !== cityA.label) {
      nextParams.set(SIDEBAR_PARAMS.COMPARE_CITY_A, cityA.label);
      changed = true;
    }
    if (nextParams.get(SIDEBAR_PARAMS.COMPARE_CITY_B) !== cityB.label) {
      nextParams.set(SIDEBAR_PARAMS.COMPARE_CITY_B, cityB.label);
      changed = true;
    }
    if (changed) setSearchParams(nextParams, { replace: true });
  }, [cityA.label, cityB.label]); // eslint-disable-line react-hooks/exhaustive-deps

  const subtitle: TChartSubtitle =
    dataset === DATASETS.CLIMATE ? { dataset, climatePeriod } : { dataset, weatherYear };

  const {
    cityA: dataA,
    cityB: dataB,
    isLoading,
    error,
  } = useGetCompareData(cityA.lat, cityA.lng, cityB.lat, cityB.lng, gridSize);

  return (
    <CompareCitiesView
      cityA={cityA}
      cityB={cityB}
      dataA={dataA}
      dataB={dataB}
      autoGrid={gridSize}
      subtitle={subtitle}
      selectedMonths={selectedMonths}
      isLoading={isLoading}
      error={error}
      onCityASelect={selectCityA}
      onCityBSelect={selectCityB}
    />
  );
}
