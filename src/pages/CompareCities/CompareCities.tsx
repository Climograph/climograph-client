import type { TChartSubtitle } from "@/components/TempPrecipChart";
import { DATASETS, SIDEBAR_PARAMS } from "@/constants";
import { useGetCompareData, usePersistedComparisonCities } from "@/hooks";
import { useFiltersStore } from "@/stores";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CompareCitiesView } from "./CompareCitiesView";

export function CompareCities() {
  const { cityA, cityB, selectCityA, selectCityB } = usePersistedComparisonCities();
  const { gridSize, dataset, climatePeriod, weatherYear } = useFiltersStore();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    let changed = false;
    const labelA = cityA?.label ?? "";
    const labelB = cityB?.label ?? "";
    if (nextParams.get(SIDEBAR_PARAMS.COMPARE_CITY_A) !== labelA) {
      nextParams.set(SIDEBAR_PARAMS.COMPARE_CITY_A, labelA);
      changed = true;
    }
    if (nextParams.get(SIDEBAR_PARAMS.COMPARE_CITY_B) !== labelB) {
      nextParams.set(SIDEBAR_PARAMS.COMPARE_CITY_B, labelB);
      changed = true;
    }
    if (changed) setSearchParams(nextParams, { replace: true });
  }, [cityA?.label, cityB?.label]); // eslint-disable-line react-hooks/exhaustive-deps

  const subtitle: TChartSubtitle =
    dataset === DATASETS.CLIMATE ? { dataset, climatePeriod } : { dataset, weatherYear };

  const {
    cityA: dataA,
    cityB: dataB,
    isLoading,
    error,
  } = useGetCompareData(
    cityA?.lat ?? null,
    cityA?.lng ?? null,
    cityB?.lat ?? null,
    cityB?.lng ?? null,
    gridSize,
  );

  return (
    <CompareCitiesView
      cityA={cityA}
      cityB={cityB}
      dataA={dataA}
      dataB={dataB}
      autoGrid={gridSize}
      subtitle={subtitle}
      isLoading={isLoading}
      error={error}
      onCityASelect={selectCityA}
      onCityBSelect={selectCityB}
    />
  );
}
