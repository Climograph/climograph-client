import { WorldClimService } from "@/api";
import { WORLDCLIM_VARIABLES } from "@/constants";
import type { TCellSize, TMonthlyTemperature } from "@/types";
import { buildMonthlyTemperatures, extractPixelIri } from "@/utils";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export function useGetClimateData(
  lat: number,
  lng: number,
  gridSize: TCellSize,
): UseQueryResult<TMonthlyTemperature[], Error> {
  return useQuery<TMonthlyTemperature[], Error>({
    queryKey: ["climate", lat, lng, gridSize],
    queryFn: async (): Promise<TMonthlyTemperature[]> => {
      const pixelsResponse = await WorldClimService.getPixelsForPoint(lat, lng, gridSize, [
        WORLDCLIM_VARIABLES.TMIN,
        WORLDCLIM_VARIABLES.TMAX,
        WORLDCLIM_VARIABLES.PREC,
      ]);

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
    },
    staleTime: Infinity,
    retry: 1,
    keepPreviousData: true,
  });
}
