import type { TChartSubtitle } from "@/components/TempPrecipChart";
import { DATASETS } from "@/constants";
import { useGetCompareData, usePersistedComparisonCities } from "@/hooks";
import { useFiltersStore } from "@/stores";
import { CompareCitiesView } from "./CompareCitiesView";

export function CompareCities() {
  const { cityA, cityB, selectCityA, selectCityB } = usePersistedComparisonCities();
  const { gridSize, dataset, climatePeriod, weatherYear } = useFiltersStore();

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
      isLoading={isLoading}
      error={error}
      onCityASelect={selectCityA}
      onCityBSelect={selectCityB}
    />
  );
}
