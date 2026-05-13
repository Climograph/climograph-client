import type { TWorldClimAvgBoxBinding, TWorldClimBoxBinding } from "@/types";
import { cssVar, hexToRgb, GRID_DELTA, iriToCellBounds } from "@/utils";
import type { TCellBounds } from "@/utils";

export { GRID_DELTA, iriToCellBounds };
export type { TCellBounds };

/** Candidate key sets — SPARQL variable names are API-defined; fallbacks cover naming variants */
const KEY_SETS = [
  Array.from({ length: 12 }, (_, i) => `valueMonth${String(i + 1).padStart(2, "0")}`),
  Array.from({ length: 12 }, (_, i) => `value${String(i + 1).padStart(2, "0")}`),
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

/** Five-stop color scale defined as CSS custom properties in global.css */
const HEATMAP_CSS_VARS = [
  { t: 0, name: "--color-heatmap-0" },
  { t: 0.25, name: "--color-heatmap-25" },
  { t: 0.5, name: "--color-heatmap-50" },
  { t: 0.75, name: "--color-heatmap-75" },
  { t: 1, name: "--color-heatmap-100" },
] as const;

type TRgbStop = { t: number; r: number; g: number; b: number };

let colorStopsCache: TRgbStop[] | null = null;

function getColorStops(): TRgbStop[] {
  if (colorStopsCache !== null) return colorStopsCache;
  colorStopsCache = HEATMAP_CSS_VARS.map(({ t, name }) => {
    const { r, g, b } = hexToRgb(cssVar(name));
    return { t, r, g, b };
  });
  return colorStopsCache;
}

export function interpolateColor(t: number): string {
  const stops = getColorStops();
  const clamped = Math.max(0, Math.min(1, t));

  let lo = stops[0];
  let hi = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped <= stops[i + 1].t) {
      lo = stops[i];
      hi = stops[i + 1];
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

/** lng lat order in WKT spec — note the inversion from the [lat, lng] input */
export function polygonToWkt(vertices: [number, number][]): string {
  const ring = [...vertices, vertices[0]];
  const coords = ring.map(([lat, lng]) => `${lng} ${lat}`).join(", ");
  return `POLYGON((${coords}))`;
}
