import type { TWorldClimAvgBoxBinding, TWorldClimBoxBinding } from "@/types";
import { GRID_DELTA, iriToCellBounds } from "@/utils";
import type { TCellBounds } from "@/utils";

export { GRID_DELTA, iriToCellBounds };
export type { TCellBounds };

// Candidate key sets to try — the actual SPARQL variable names are API-defined.
// First set uses the resource-endpoint convention; fallbacks cover common SPARQL naming.
const KEY_SETS = [
  // "valueMonth01" … "valueMonth12"
  Array.from({ length: 12 }, (_, i) => `valueMonth${String(i + 1).padStart(2, "0")}`),
  // "value01" … "value12"
  Array.from({ length: 12 }, (_, i) => `value${String(i + 1).padStart(2, "0")}`),
  // "v1" … "v12"
  Array.from({ length: 12 }, (_, i) => `v${i + 1}`),
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

  // None of the known key patterns matched — log the actual binding shape once.
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

export type THeatmapStats = {
  min: number;
  max: number;
  avg: number;
  count: number;
};

export function computeHeatmapStats(
  pixelBindings: TWorldClimBoxBinding[],
  avgBinding: TWorldClimAvgBoxBinding | null,
): THeatmapStats {
  const values = pixelBindings.map(pixelAnnualAvg).filter((v) => !isNaN(v) && v !== 0);

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

// Five-stop color scale: cold blue → green → warm yellow → orange-red → dark red
const COLOR_STOPS: { t: number; r: number; g: number; b: number }[] = [
  { t: 0, r: 133, g: 183, b: 235 }, // #85B7EB
  { t: 0.25, r: 159, g: 225, b: 203 }, // #9FE1CB
  { t: 0.5, r: 250, g: 199, b: 117 }, // #FAC775
  { t: 0.75, r: 216, g: 90, b: 48 }, // #D85A30
  { t: 1, r: 163, g: 45, b: 45 }, // #A32D2D
];

export function interpolateColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));

  let lo = COLOR_STOPS[0];
  let hi = COLOR_STOPS[COLOR_STOPS.length - 1];

  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (clamped <= COLOR_STOPS[i + 1].t) {
      lo = COLOR_STOPS[i];
      hi = COLOR_STOPS[i + 1];
      break;
    }
  }

  const range = hi.t - lo.t;
  const localT = range === 0 ? 0 : (clamped - lo.t) / range;

  const r = Math.round(lo.r + (hi.r - lo.r) * localT);
  const g = Math.round(lo.g + (hi.g - lo.g) * localT);
  const b = Math.round(lo.b + (hi.b - lo.b) * localT);

  return `rgb(${r},${g},${b})`;
}

export function valueToColor(value: number, min: number, max: number): string {
  const t = max === min ? 0.5 : (value - min) / (max - min);
  return interpolateColor(t);
}

export function gridDelta(gridSize: string): number {
  return GRID_DELTA[gridSize] ?? GRID_DELTA["10m"];
}

// Converts [lat, lng][] vertices to a closed WKT POLYGON string (lng lat order per WKT spec).
export function polygonToWkt(vertices: [number, number][]): string {
  const ring = [...vertices, vertices[0]];
  const coords = ring.map(([lat, lng]) => `${lng} ${lat}`).join(", ");
  return `POLYGON((${coords}))`;
}
