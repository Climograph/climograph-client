import { WorldClimService } from "@/api";
import { CLIMATE_START, WORLDCLIM_VARIABLES } from "@/constants";
import type { TCellSize, TMonthlyTemperature } from "@/types";
import { buildMonthlyTemperatures, extractPixelIri } from "@/utils";
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
  periodStart: number,
): Promise<TMonthlyTemperature[]> {
  const pixelsResponse = await WorldClimService.getPixelsForPoint(
    lat,
    lng,
    gridSize,
    [WORLDCLIM_VARIABLES.TMIN, WORLDCLIM_VARIABLES.TMAX, WORLDCLIM_VARIABLES.PREC],
    isClimate,
    isClimate ? undefined : periodStart,
  );

  const iris = pixelsResponse.results.bindings.map((b) => b.pixel.value);

  const tminIri = extractPixelIri(iris, WORLDCLIM_VARIABLES.TMIN);
  const tmaxIri = extractPixelIri(iris, WORLDCLIM_VARIABLES.TMAX);
  const precIri = extractPixelIri(iris, WORLDCLIM_VARIABLES.PREC);

  if (!tminIri || !tmaxIri || !precIri) {
    throw new Error(`No pixels found for (${lat}, ${lng}) at ${gridSize}`);
  }

  const [tminData, tmaxData, precData] = await Promise.all([
    WorldClimService.getPixelResource(tminIri),
    WorldClimService.getPixelResource(tmaxIri),
    WorldClimService.getPixelResource(precIri),
  ]);

  return buildMonthlyTemperatures(tminData, tmaxData, precData);
}

export function useGetCompareData(
  latA: number,
  lngA: number,
  latB: number,
  lngB: number,
  gridSize: TCellSize,
  periodStart: number,
): TUseGetCompareDataReturn {
  const isClimate = periodStart === CLIMATE_START;
  const enabled = latA !== 0 && lngA !== 0 && latB !== 0 && lngB !== 0;

  const { data, isLoading, error } = useQuery<TCompareData, Error>({
    queryKey: ["compare", latA, lngA, latB, lngB, gridSize, periodStart],
    queryFn: async (): Promise<TCompareData> => {
      const [cityA, cityB] = await Promise.all([
        fetchCityData(latA, lngA, gridSize, isClimate, periodStart),
        fetchCityData(latB, lngB, gridSize, isClimate, periodStart),
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
