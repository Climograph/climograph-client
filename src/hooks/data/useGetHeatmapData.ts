import { WorldClimService } from "@/api/services/worldClimService";
import type { TClimatePeriod } from "@/constants";
import type { TCellSize, TVariable } from "@/types";
import type { TWorldClimAvgBoxResponse, TWorldClimBoxResponse } from "@/types/api/worldclim.dto";
import { useQuery } from "@tanstack/react-query";

export type TBbox = {
  north: number;
  south: number;
  west: number;
  east: number;
};

type THeatmapResult = {
  pixels: TWorldClimBoxResponse;
  avg: TWorldClimAvgBoxResponse;
};

export function useGetHeatmapData(
  bbox: TBbox | null,
  gridSize: TCellSize,
  variable: TVariable,
  isClimate: boolean,
  climatePeriod: TClimatePeriod,
  year?: number,
) {
  const enabled = bbox !== null;

  const { data, isLoading, error } = useQuery<THeatmapResult, Error>({
    queryKey: [
      "heatmap",
      bbox?.north,
      bbox?.south,
      bbox?.west,
      bbox?.east,
      gridSize,
      variable,
      isClimate ? climatePeriod : year,
    ],
    queryFn: async (): Promise<THeatmapResult> => {
      const { north, south, west, east } = bbox!;
      const variables = [`${variable}`];

      const [rawPixels, avg] = await Promise.all([
        WorldClimService.getPixelValuesInBox(
          north,
          south,
          west,
          east,
          gridSize,
          variables,
          isClimate,
          isClimate ? undefined : year,
        ),
        WorldClimService.getAvgPixelValuesInBox(
          north,
          south,
          west,
          east,
          gridSize,
          variables,
          isClimate,
          isClimate ? undefined : year,
        ),
      ]);

      if (import.meta.env.DEV) {
        const sample = rawPixels.results.bindings.slice(0, 3);
        console.warn("[useGetHeatmapData] raw bindings sample:", sample);
        if (sample[0]) {
          console.warn("[useGetHeatmapData] binding keys:", Object.keys(sample[0]));
          console.warn("[useGetHeatmapData] first binding:", JSON.stringify(sample[0], null, 2));
        }
      }

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
