import type { TCellSize } from "@/types";
import type { TCellBounds } from "@/utils";

export type TLeafletMapProps = {
  lat: number;
  lng: number;
  label?: string;
  onMapClick: (lat: number, lng: number) => void;
  className?: string;
  cellBounds?: TCellBounds;
  gridSize?: TCellSize;
};

export type TMapUpdaterProps = {
  lat: number;
  lng: number;
};

export type TCellBoundsLayerProps = {
  cellBounds: TCellBounds;
  gridSize?: TCellSize;
};
