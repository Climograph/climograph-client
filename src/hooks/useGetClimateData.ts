import { WorldClimService } from "@/api";
import { WORLDCLIM_VARIABLES } from "@/constants";
import type { TCellSize, TMonthlyTemperature } from "@/types/domain/climate";
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
      ]);

      const iris = pixelsResponse.results.bindings.map((b) => b.pixel.value);
      const tminIri = extractPixelIri(iris, WORLDCLIM_VARIABLES.TMIN);
      const tmaxIri = extractPixelIri(iris, WORLDCLIM_VARIABLES.TMAX);

      if (!tminIri || !tmaxIri) {
        throw new Error(`No tmin/tmax pixels found for (${lat}, ${lng}) at ${gridSize}`);
      }

      const [tminData, tmaxData] = await Promise.all([
        WorldClimService.getPixelResource(tminIri),
        WorldClimService.getPixelResource(tmaxIri),
      ]);

      return buildMonthlyTemperatures(tminData, tmaxData);
    },
    staleTime: Infinity,
    retry: 1,
  });
}
