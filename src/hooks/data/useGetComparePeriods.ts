import { CLIMATE_PERIODS } from "@/constants";
import type { TCellSize, TMonthlyTemperature } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { fetchCityData } from "./useGetCompareData";

type TComparePeriods = {
  dataA: TMonthlyTemperature[];
  dataB: TMonthlyTemperature[];
};

type TUseGetComparePeriodsReturn = {
  dataA: TMonthlyTemperature[];
  dataB: TMonthlyTemperature[];
  isLoading: boolean;
  error: Error | null;
};

export function useGetComparePeriods(
  lat: number | null,
  lng: number | null,
  periodA: number,
  periodB: number,
  gridSize: TCellSize,
): TUseGetComparePeriodsReturn {
  const enabled = lat !== null && lng !== null;

  const { data, isLoading, error } = useQuery<TComparePeriods, Error>({
    queryKey: ["compare-periods", lat, lng, periodA, periodB, gridSize],
    queryFn: async (): Promise<TComparePeriods> => {
      if (lat === null || lng === null) throw new Error("No location selected");
      const [dataA, dataB] = await Promise.all([
        fetchCityData(lat, lng, gridSize, false, CLIMATE_PERIODS.C1970_2000, periodA),
        fetchCityData(lat, lng, gridSize, false, CLIMATE_PERIODS.C1970_2000, periodB),
      ]);
      return { dataA, dataB };
    },
    enabled,
    staleTime: Infinity,
    retry: 1,
    keepPreviousData: true,
  });

  return {
    dataA: data?.dataA ?? [],
    dataB: data?.dataB ?? [],
    isLoading: enabled && isLoading,
    error: error ?? null,
  };
}
