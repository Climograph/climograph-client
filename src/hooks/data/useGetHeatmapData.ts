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

      console.warn("[useGetHeatmapData] Request params:", {
        id: "pixelvaluesinbox / avgpixelvaluesinbox",
        north,
        south,
        west,
        east,
        grid: gridSize,
        var: variable,
        ...(isClimate ? { isClimate: true, climatePeriod } : { isWeather: true, year }),
      });

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

      console.warn("[useGetHeatmapData] Bindings received:", rawPixels.results.bindings.length);

      let filteredBindings = rawPixels.results.bindings;
      if (isClimate) {
        filteredBindings = rawPixels.results.bindings.filter((b) =>
          b.pixel?.value.includes(climatePeriod),
        );
        console.warn(
          `[useGetHeatmapData] Bindings after '${climatePeriod}' filter:`,
          filteredBindings.length,
        );
      }

      console.warn("[useGetHeatmapData] First 3 bindings:", filteredBindings.slice(0, 3));

      const pixels: TWorldClimBoxResponse = { results: { bindings: filteredBindings } };
      return { pixels, avg };
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
