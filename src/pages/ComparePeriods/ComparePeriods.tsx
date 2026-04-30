import { CLIMATE_RANGE, CLIMATE_START } from "@/constants";
import { useGetComparePeriods, usePersistedComparisonCities } from "@/hooks";
import { useFiltersStore } from "@/stores";
import { useState } from "react";
import { ComparePeriodsView } from "./ComparePeriodsView";

export function ComparePeriods() {
  const { cityA, selectCityA } = usePersistedComparisonCities();
  const [periodA, setPeriodA] = useState<number>(CLIMATE_START);
  const [periodB, setPeriodB] = useState<number>(CLIMATE_RANGE.MAX_START);
  const { gridSize } = useFiltersStore();

  const { dataA, dataB, isLoading, error } = useGetComparePeriods(
    cityA.lat,
    cityA.lng,
    periodA,
    periodB,
    gridSize,
  );

  return (
    <ComparePeriodsView
      city={cityA}
      periodA={periodA}
      periodB={periodB}
      dataA={dataA}
      dataB={dataB}
      autoGrid={gridSize}
      isLoading={isLoading}
      error={error}
      onCitySelect={selectCityA}
      onPeriodAChange={setPeriodA}
      onPeriodBChange={setPeriodB}
    />
  );
}
