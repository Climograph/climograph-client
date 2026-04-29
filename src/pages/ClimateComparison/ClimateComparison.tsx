import { AUTO_RESOLUTION, CLIMATE_RANGE, CLIMATE_START, SIDEBAR_PARAMS } from "@/constants";
import { useGetCompareData, useGetComparePeriods, usePersistedComparisonCities } from "@/hooks";
import type { TCellSize } from "@/types";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { TComparisonMode } from "./ClimateComparison.type";
import { ClimateComparisonView } from "./ClimateComparisonView";

export function ClimateComparison() {
  const { cityA, cityB, selectCityA, selectCityB } = usePersistedComparisonCities();
  const [comparisonMode, setComparisonMode] = useState<TComparisonMode>("cities");
  const [periodA, setPeriodA] = useState<number>(CLIMATE_START);
  const [periodB, setPeriodB] = useState<number>(CLIMATE_RANGE.MAX_START);

  const [searchParams] = useSearchParams();
  const yearStart = searchParams.get(SIDEBAR_PARAMS.YEAR_START);
  const periodStart = yearStart ? Number(yearStart) : CLIMATE_START;
  const isClimate = yearStart === null;
  const citiesDefaultGrid: TCellSize = isClimate
    ? AUTO_RESOLUTION.CLIMATE
    : AUTO_RESOLUTION.WEATHER;
  const periodsDefaultGrid: TCellSize = AUTO_RESOLUTION.WEATHER;
  const urlGrid = searchParams.get(SIDEBAR_PARAMS.GRID) as TCellSize | null;
  const autoGrid: TCellSize =
    urlGrid ?? (comparisonMode === "periods" ? periodsDefaultGrid : citiesDefaultGrid);

  const {
    cityA: compareCitiesDataA,
    cityB: compareCitiesDataB,
    isLoading: compareCitiesLoading,
    error: compareCitiesError,
  } = useGetCompareData(cityA.lat, cityA.lng, cityB.lat, cityB.lng, autoGrid, periodStart);

  const periodsLat = comparisonMode === "periods" ? cityA.lat : null;
  const periodsLng = comparisonMode === "periods" ? cityA.lng : null;

  const {
    dataA: comparePeriodsDataA,
    dataB: comparePeriodsDataB,
    isLoading: comparePeriodsLoading,
    error: comparePeriodsError,
  } = useGetComparePeriods(periodsLat, periodsLng, periodA, periodB, autoGrid);

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
      autoGrid={autoGrid}
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
