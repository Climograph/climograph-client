import type { TBbox } from "@/hooks";
import type { TCellSize, TWikidataCity } from "@/types";
import type { TWorldClimAvgBoxResponse, TWorldClimBoxResponse } from "@/types";

export type TDrawMode = "none" | "bbox" | "polygon";

export type TPolygon = [number, number][];

export type TMapTarget = { lat: number; lng: number };

export type TRegionHeatmapViewProps = {
  bbox: TBbox | null;
  polygon: TPolygon | null;
  pixels: TWorldClimBoxResponse | null;
  avg: TWorldClimAvgBoxResponse | null;
  gridSize: TCellSize;
  drawMode: TDrawMode;
  isLoading: boolean;
  error: Error | null;
  mapTarget: TMapTarget | null;
  onDrawModeChange: (mode: TDrawMode) => void;
  onBboxChange: (bbox: TBbox | null) => void;
  onPolygonChange: (polygon: TPolygon | null) => void;
  onCitySelect: (city: TWikidataCity) => void;
};
