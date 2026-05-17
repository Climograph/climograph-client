import type { TWorldClimAvgBoxBinding, TWorldClimBoxBinding } from "@/types";
import { CELL_SIZE_OPTIONS, GRID_DELTA, MONTH_NAMES } from "@/constants";
import { iriToCellBounds } from "@/utils";
import type { TCellBounds, TCellSize } from "@/types";
import type { THeatmapStats } from "./HeatMap.type";

export { GRID_DELTA, iriToCellBounds };
export type { TCellBounds, TCellSize };

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

type TLooseBinding = Record<string, unknown>;

function extractNumber(raw: unknown): number {
  if (raw === undefined || raw === null) return NaN;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") return parseFloat(raw);
  if (typeof raw === "object") {
    const v = (raw as Record<string, unknown>)["value"];
    if (typeof v === "number") return v;
    if (typeof v === "string") return parseFloat(v);
  }
  return NaN;
}

function readMonthlySum(binding: TLooseBinding): number {
  for (const keys of KEY_SETS) {
    const first = binding[keys[0]];
    if (first !== undefined) {
      return keys.reduce((s, k) => {
        const n = extractNumber(binding[k]);
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

export function pixelSelectedAvg(binding: TWorldClimBoxBinding, selectedMonths: number[]): number {
  if (selectedMonths.length === 0) return pixelAnnualAvg(binding);
  const loose = binding as TLooseBinding;
  for (const keys of KEY_SETS) {
    if (loose[keys[0]] === undefined) continue;
    const sum = selectedMonths.reduce((s, m) => {
      const n = extractNumber(loose[keys[m - 1]]);
      return s + (isNaN(n) ? 0 : n);
    }, 0);
    return sum / selectedMonths.length;
  }
  return 0;
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

/** "2.5 min" from "2.5 min (~20.25 km²)" */
export function shortGridLabel(gridSize: TCellSize): string {
  return CELL_SIZE_OPTIONS[gridSize]?.split(" (~")[0] ?? gridSize;
}

/**
 * Returns a short month string for the summary bar.
 * [] → ""   [2] → "Feb"   [1,2,3] → "Jan, Feb, Mar"   [1..6] → "6 months"
 */
export function formatSelectedMonths(selectedMonths: number[]): string {
  if (selectedMonths.length === 0) return "";
  if (selectedMonths.length <= 3)
    return selectedMonths.map((m) => MONTH_NAMES[m - 1].slice(0, 3)).join(", ");
  return `${selectedMonths.length} months`;
}
