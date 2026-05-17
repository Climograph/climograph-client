import { WorldClimService } from "@/api/services/worldClimService";
import type { TClimatePeriod } from "@/constants";
import type { TWorldClimAvgBoxResponse, TWorldClimBoxResponse } from "@/types/api/worldclim.dto";
import type { TCellSize, TVariable } from "@/types";
import { useQuery } from "@tanstack/react-query";

type TPolygonResult = {
  pixels: TWorldClimBoxResponse;
  avg: TWorldClimAvgBoxResponse;
};

export function useGetHeatmapPolygonData(
  wkt: string | null,
  gridSize: TCellSize,
  variable: TVariable,
  isClimate: boolean,
  climatePeriod: TClimatePeriod,
  year?: number,
) {
  const enabled = wkt !== null;
  const variables = [`${variable}`];

  const { data, isLoading, error } = useQuery<TPolygonResult, Error>({
    queryKey: ["heatmap-polygon", wkt, gridSize, variable, isClimate ? climatePeriod : year],
    queryFn: async (): Promise<TPolygonResult> => {
      const [rawPixels, avg] = await Promise.all([
        WorldClimService.getPixelValuesInPolygon(
          wkt!,
          gridSize,
          variables,
          isClimate,
          isClimate ? undefined : year,
        ),
        WorldClimService.getAvgPixelValuesInPolygon(
          wkt!,
          gridSize,
          variables,
          isClimate,
          isClimate ? undefined : year,
        ),
      ]);

      // Filter by period client-side; fall back to all bindings if IRIs don't embed the period
      const allPixelBindings = rawPixels.results.bindings;
      const periodPixelBindings = isClimate
        ? allPixelBindings.filter((b) => b.pixel?.value?.includes(climatePeriod))
        : allPixelBindings;
      const filteredBindings =
        isClimate && periodPixelBindings.length === 0 ? allPixelBindings : periodPixelBindings;

      const allAvgBindings = avg.results.bindings;
      const filteredAvgBindings = isClimate
        ? allAvgBindings.filter((b) => b.raster?.value?.includes(climatePeriod))
        : allAvgBindings;

      const pixels: TWorldClimBoxResponse = { results: { bindings: filteredBindings } };
      const filteredAvg: typeof avg = { results: { bindings: filteredAvgBindings } };
      return { pixels, avg: filteredAvg };
    },
    enabled,
    staleTime: Infinity,
    retry: 1,
  });

  return {
    pixels: data?.pixels ?? null,
    avg: data?.avg ?? null,
    isLoading: enabled && isLoading,
    error: error instanceof Error ? error : null,
  };
}
