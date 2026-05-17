import type { TBbox } from "@/hooks";
import type {
  TCellSize,
  TColorScale,
  TVariable,
  TWorldClimAvgBoxResponse,
  TWorldClimBoxBinding,
  TWorldClimBoxResponse,
  TWikidataCity,
} from "@/types";

export type TDrawMode = "none" | "bbox" | "polygon";

export type TPolygon = [number, number][];

export type TMapTarget = { lat: number; lng: number };

export type THeatmapStats = {
  min: number;
  max: number;
  avg: number;
  count: number;
};

export type TRegionHeatmapViewProps = {
  bbox: TBbox | null;
  polygon: TPolygon | null;
  pixels: TWorldClimBoxResponse | null;
  avg: TWorldClimAvgBoxResponse | null;
  gridSize: TCellSize;
  activeVariable: TVariable;
  colorScale: TColorScale;
  drawMode: TDrawMode;
  isLoading: boolean;
  isLocating: boolean;
  error: Error | null;
  locationError: string | null;
  mapTarget: TMapTarget | null;
  onDrawModeChange: (mode: TDrawMode) => void;
  onBboxChange: (bbox: TBbox | null) => void;
  onPolygonChange: (polygon: TPolygon | null) => void;
  onCitySelect: (city: TWikidataCity) => void;
  onLocate: () => void;
  onClearLocationError: () => void;
};

// Sub-component prop types

export type THeatmapLayerProps = {
  bindings: TWorldClimBoxBinding[];
  gridSize: string;
  scale: TColorScale;
  bbox: TBbox | null;
  polygon: TPolygon | null;
};

export type TMapNavigatorProps = { target: TMapTarget | null };

export type TMapFitterProps = { bbox: TBbox | null };

export type TBboxDrawerProps = {
  isDrawMode: boolean;
  onBboxComplete: (bbox: TBbox) => void;
};

export type TBboxOutlineProps = { bbox: TBbox };

export type TPolygonDrawerProps = { onPolygonComplete: (v: TPolygon) => void };

export type TPolygonOutlineProps = { vertices: TPolygon };

export type TToolbarProps = {
  drawMode: TDrawMode;
  hasSelection: boolean;
  onBboxModeToggle: () => void;
  onPolygonModeToggle: () => void;
  onClear: () => void;
};

export type TColorLegendProps = { min: number; max: number; scale: TColorScale; unit: string };

export type TLegendPanelProps = {
  hasData: boolean;
  stats: THeatmapStats;
  scale: TColorScale;
  unit: string;
};

export type TStatCardProps = { label: string; value: string };

export type TStatsGridProps = { hasData: boolean; stats: THeatmapStats; unit: string };

export type TMapCanvasProps = {
  bbox: TBbox | null;
  polygon: TPolygon | null;
  drawMode: TDrawMode;
  gridSize: string;
  colorScale: TColorScale;
  mapTarget: TMapTarget | null;
  bindings: TWorldClimBoxBinding[];
  isLoading: boolean;
  onBboxComplete: (bbox: TBbox) => void;
  onPolygonComplete: (polygon: TPolygon) => void;
};
