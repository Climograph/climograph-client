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
      console.warn("[useGetHeatmapPolygonData] Request params:", {
        id: "pixelvaluesinpolygonGEO / avgpixelvaluesinpolygonGEO",
        wkt,
        grid: gridSize,
        var: variable,
        ...(isClimate ? { isClimate: true, climatePeriod } : { isWeather: true, year }),
      });

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

      console.warn(
        "[useGetHeatmapPolygonData] Bindings received:",
        rawPixels.results.bindings.length,
      );

      let filteredBindings = rawPixels.results.bindings;
      if (isClimate) {
        filteredBindings = rawPixels.results.bindings.filter((b) =>
          b.pixel?.value.includes(climatePeriod),
        );
        console.warn(
          `[useGetHeatmapPolygonData] Bindings after '${climatePeriod}' filter:`,
          filteredBindings.length,
        );
      }

      console.warn("[useGetHeatmapPolygonData] First 3 bindings:", filteredBindings.slice(0, 3));

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
