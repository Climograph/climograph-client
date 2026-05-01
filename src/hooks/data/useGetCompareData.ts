import { WorldClimService } from "@/api";
import { DATASETS, WEATHER_VARIABLES } from "@/constants";
import type { TClimatePeriod } from "@/constants/worldclim.constant";
import { useFiltersStore } from "@/stores";
import type { TCellSize, TMonthlyTemperature } from "@/types";
import { buildMonthlyTemperaturesFromPointValues } from "@/utils";
import { useQuery } from "@tanstack/react-query";

type TCompareData = {
  cityA: TMonthlyTemperature[];
  cityB: TMonthlyTemperature[];
};

type TUseGetCompareDataReturn = {
  cityA: TMonthlyTemperature[];
  cityB: TMonthlyTemperature[];
  isLoading: boolean;
  error: Error | null;
};

export async function fetchCityData(
  lat: number,
  lng: number,
  gridSize: TCellSize,
  isClimate: boolean,
  climatePeriod: TClimatePeriod,
  year?: number,
): Promise<TMonthlyTemperature[]> {
  const response = isClimate
    ? await WorldClimService.getClimateDataForPoint(
        lat,
        lng,
        gridSize,
        WEATHER_VARIABLES,
        climatePeriod,
      )
    : await WorldClimService.getWeatherDataForPoint(
        lat,
        lng,
        gridSize,
        WEATHER_VARIABLES,
        year ?? new Date().getFullYear(),
      );
  return buildMonthlyTemperaturesFromPointValues(response.results.bindings);
}

export function useGetCompareData(
  latA: number,
  lngA: number,
  latB: number,
  lngB: number,
  gridSize: TCellSize,
): TUseGetCompareDataReturn {
  const { dataset, climatePeriod, weatherYear } = useFiltersStore();
  const isClimate = dataset === DATASETS.CLIMATE;
  const year = isClimate ? undefined : weatherYear;

  const enabled = latA !== 0 && lngA !== 0 && latB !== 0 && lngB !== 0;

  const { data, isLoading, error } = useQuery<TCompareData, Error>({
    queryKey: [
      "compare",
      latA,
      lngA,
      latB,
      lngB,
      gridSize,
      isClimate ? climatePeriod : weatherYear,
    ],
    queryFn: async (): Promise<TCompareData> => {
      const [cityA, cityB] = await Promise.all([
        fetchCityData(latA, lngA, gridSize, isClimate, climatePeriod, year),
        fetchCityData(latB, lngB, gridSize, isClimate, climatePeriod, year),
      ]);
      return { cityA, cityB };
    },
    enabled,
    staleTime: Infinity,
    retry: 1,
    keepPreviousData: true,
  });

  return {
    cityA: data?.cityA ?? [],
    cityB: data?.cityB ?? [],
    isLoading: enabled && isLoading,
    error: error ?? null,
  };
}
