import type { TCellSize } from "@/types";

const CELL_SIZE_DEGREES: Record<TCellSize, number> = {
  "10m": 0.1667,
  "5m": 0.0833,
  "2.5m": 0.0417,
  "30s": 0.00833,
};

export type TCellCountStatus = {
  labelKey: string;
  colorClass: string;
};

export function estimateCellCount(
  bbox: { north: number; south: number; east: number; west: number },
  gridSize: TCellSize,
): number {
  const size = CELL_SIZE_DEGREES[gridSize];
  return Math.ceil((bbox.north - bbox.south) / size) * Math.ceil((bbox.east - bbox.west) / size);
}

export function getCellCountStatus(count: number): TCellCountStatus {
  if (count < 500)
    return { labelKey: "sidebar.cellCount.fast", colorClass: "bg-green-100 text-green-700" };
  if (count < 2000)
    return { labelKey: "sidebar.cellCount.moderate", colorClass: "bg-yellow-100 text-yellow-700" };
  if (count <= 10_000)
    return { labelKey: "sidebar.cellCount.slow", colorClass: "bg-orange-100 text-orange-700" };
  return { labelKey: "sidebar.cellCount.tooMany", colorClass: "bg-red-100 text-red-700" };
}
