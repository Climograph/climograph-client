import { WorldClimService } from "@/api/services/worldClimService";
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
      isClimate,
      year,
    ],
    queryFn: async (): Promise<THeatmapResult> => {
      const { north, south, west, east } = bbox!;
      const variables = [`${variable}`];
      const [pixels, avg] = await Promise.all([
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
