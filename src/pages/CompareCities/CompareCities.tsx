import { CLIMATE_START, DATASETS } from "@/constants";
import { useGetCompareData, usePersistedComparisonCities } from "@/hooks";
import { useFiltersStore } from "@/stores";
import { CompareCitiesView } from "./CompareCitiesView";

export function CompareCities() {
  const { cityA, cityB, selectCityA, selectCityB } = usePersistedComparisonCities();
  const { dataset, periodStart: storePeriodStart, gridSize } = useFiltersStore();
  const isClimate = dataset === DATASETS.CLIMATE;
  const effectivePeriodStart = isClimate ? CLIMATE_START : storePeriodStart;

  const {
    cityA: dataA,
    cityB: dataB,
    isLoading,
    error,
  } = useGetCompareData(cityA.lat, cityA.lng, cityB.lat, cityB.lng, gridSize, effectivePeriodStart);

  return (
    <CompareCitiesView
      cityA={cityA}
      cityB={cityB}
      dataA={dataA}
      dataB={dataB}
      autoGrid={gridSize}
      isLoading={isLoading}
      error={error}
      onCityASelect={selectCityA}
      onCityBSelect={selectCityB}
    />
  );
}
