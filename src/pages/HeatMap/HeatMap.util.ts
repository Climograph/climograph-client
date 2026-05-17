import type { TWorldClimAvgBoxBinding, TWorldClimBoxBinding } from "@/types";
import { GRID_DELTA } from "@/constants";
import { iriToCellBounds } from "@/utils";
import type { TCellBounds } from "@/types";
import type { THeatmapStats } from "./HeatMap.type";

export { GRID_DELTA, iriToCellBounds };
export type { TCellBounds };

/** Candidate key sets — SPARQL variable names are API-defined; fallbacks cover naming variants */
const KEY_SETS = [
  Array.from({ length: 12 }, (_, i) => `valueMonth${String(i + 1).padStart(2, "0")}`), // valueMonth01..12
  Array.from({ length: 12 }, (_, i) => `valueMonth${i + 1}`), // valueMonth1..12
  Array.from({ length: 12 }, (_, i) => `value${String(i + 1).padStart(2, "0")}`), // value01..12
  Array.from({ length: 12 }, (_, i) => `value${i + 1}`), // value1..12
  Array.from({ length: 12 }, (_, i) => `vm${String(i + 1).padStart(2, "0")}`), // vm01..12
  Array.from({ length: 12 }, (_, i) => `vm${i + 1}`), // vm1..12
  Array.from({ length: 12 }, (_, i) => `v${String(i + 1).padStart(2, "0")}`), // v01..12
  Array.from({ length: 12 }, (_, i) => `v${i + 1}`), // v1..12
  Array.from({ length: 12 }, (_, i) => `month${String(i + 1).padStart(2, "0")}`), // month01..12
  Array.from({ length: 12 }, (_, i) => `month${i + 1}`), // month1..12
];

type TLooseBinding = Record<string, { value: string } | undefined>;

function readMonthlySum(binding: TLooseBinding): number {
  for (const keys of KEY_SETS) {
    const first = binding[keys[0]];
    if (first !== undefined) {
      return keys.reduce((s, k) => {
        const f = binding[k];
        const n = f ? parseFloat(f.value) : 0;
        return s + (isNaN(n) ? 0 : n);
      }, 0);
    }
  }

  if (import.meta.env.DEV) {
    console.warn("[HeatMap] Unknown binding shape. Keys found:", Object.keys(binding));
  }
  return 0;
}

export function pixelAnnualAvg(binding: TWorldClimBoxBinding): number {
  return readMonthlySum(binding as TLooseBinding) / 12;
}

export function avgBindingAnnualAvg(binding: TWorldClimAvgBoxBinding): number {
  return readMonthlySum(binding as TLooseBinding) / 12;
}

export function computeHeatmapStats(
  pixelBindings: TWorldClimBoxBinding[],
  avgBinding: TWorldClimAvgBoxBinding | null,
): THeatmapStats {
  const values = pixelBindings.map(pixelAnnualAvg).filter((v) => !isNaN(v));

  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, count: 0 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = avgBinding
    ? avgBindingAnnualAvg(avgBinding)
    : values.reduce((s, v) => s + v, 0) / values.length;

  return { min, max, avg, count: values.length };
}

export function gridDelta(gridSize: string): number {
  return GRID_DELTA[gridSize] ?? GRID_DELTA["10m"];
}

/** lng lat order in WKT spec — note the inversion from the [lat, lng] input */
export function polygonToWkt(vertices: [number, number][]): string {
  const ring = [...vertices, vertices[0]];
  const coords = ring.map(([lat, lng]) => `${lng} ${lat}`).join(", ");
  return `POLYGON((${coords}))`;
}
