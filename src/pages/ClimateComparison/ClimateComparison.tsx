/**
 * legacy combined comparison page kept for reference at /compare-legacy
 */
import { CLIMATE_RANGE, CLIMATE_START, DATASETS } from "@/constants";
import { useGetCompareData, useGetComparePeriods, usePersistedComparisonCities } from "@/hooks";
import { useFiltersStore } from "@/stores";
import { useState } from "react";
import type { TComparisonMode } from "./ClimateComparison.type";
import { ClimateComparisonView } from "./ClimateComparisonView";

export function ClimateComparison() {
  const { cityA, cityB, selectCityA, selectCityB } = usePersistedComparisonCities();
  const [comparisonMode, setComparisonMode] = useState<TComparisonMode>("cities");
  const [periodA, setPeriodA] = useState<number>(CLIMATE_START);
  const [periodB, setPeriodB] = useState<number>(CLIMATE_RANGE.MAX_START);

  const { dataset, periodStart: storePeriodStart, gridSize } = useFiltersStore();
  const isClimate = dataset === DATASETS.CLIMATE;
  const effectivePeriodStart = isClimate ? CLIMATE_START : storePeriodStart;

  const {
    cityA: compareCitiesDataA,
    cityB: compareCitiesDataB,
    isLoading: compareCitiesLoading,
    error: compareCitiesError,
  } = useGetCompareData(cityA.lat, cityA.lng, cityB.lat, cityB.lng, gridSize, effectivePeriodStart);

  const periodsLat = comparisonMode === "periods" ? cityA.lat : null;
  const periodsLng = comparisonMode === "periods" ? cityA.lng : null;

  const {
    dataA: comparePeriodsDataA,
    dataB: comparePeriodsDataB,
    isLoading: comparePeriodsLoading,
    error: comparePeriodsError,
  } = useGetComparePeriods(periodsLat, periodsLng, periodA, periodB, gridSize);

  const isCitiesMode = comparisonMode === "cities";
  const dataA = isCitiesMode ? compareCitiesDataA : comparePeriodsDataA;
  const dataB = isCitiesMode ? compareCitiesDataB : comparePeriodsDataB;
  const isLoading = isCitiesMode ? compareCitiesLoading : comparePeriodsLoading;
  const error = isCitiesMode ? compareCitiesError : comparePeriodsError;

  return (
    <ClimateComparisonView
      comparisonMode={comparisonMode}
      cityA={cityA}
      cityB={cityB}
      periodA={periodA}
      periodB={periodB}
      dataA={dataA}
      dataB={dataB}
      autoGrid={gridSize}
      isLoading={isLoading}
      error={error}
      onComparisonModeChange={setComparisonMode}
      onCityASelect={selectCityA}
      onCityBSelect={selectCityB}
      onPeriodAChange={setPeriodA}
      onPeriodBChange={setPeriodB}
    />
  );
}
