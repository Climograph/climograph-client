import { MONTH_NAMES, WORLDCLIM_GRID_BASE, WORLDCLIM_VARIABLE_BASE } from "@/constants";
import env from "@/env";
import type {
  TCellSize,
  TMonthlyTemperature,
  TWorldClimCellResponse,
  TWorldClimPixelResource,
  TWorldClimPointValueBinding,
} from "@/types";

export const GRID_DELTA: Record<string, number> = {
  "10m": 10 / 60,
  "5m": 5 / 60,
  "2.5m": 2.5 / 60,
  "30s": 30 / 3600,
};

export type TCellBounds = {
  north: number;
  south: number;
  west: number;
  east: number;
};

const CELL_IRI_ROW_COL_REGEX = /_r(\d+)c(\d+)/;

export function iriToCellBounds(iri: string, cellSize: number): TCellBounds | null {
  const match = CELL_IRI_ROW_COL_REGEX.exec(iri);
  if (!match) return null;
  const row = Number(match[1]);
  const col = Number(match[2]);
  const north = 90 - row * cellSize;
  return {
    north,
    south: north - cellSize,
    west: -180 + col * cellSize,
    east: -180 + col * cellSize + cellSize,
  };
}

export function extractCellBySize(
  response: TWorldClimCellResponse,
  size: TCellSize,
): string | null {
  return (
    response.results.bindings.find((b) => b.grid.value.includes(`Grid_${size}`))?.cell.value ?? null
  );
}

export function extractPixelIri(iris: string[], variable: string): string | null {
  return iris.find((iri) => iri.includes(`_${variable}_`)) ?? null;
}

export function buildMonthlyTemperatures(
  tminData: TWorldClimPixelResource,
  tmaxData: TWorldClimPixelResource,
  precData: TWorldClimPixelResource,
): TMonthlyTemperature[] {
  return Array.from({ length: 12 }, (_, i) => {
    const monthKey = `valueMonth${String(i + 1).padStart(2, "0")}` as keyof TWorldClimPixelResource;
    return {
      month: i + 1,
      monthName: MONTH_NAMES[i],
      tmin: Number(tminData[monthKey]),
      tmax: Number(tmaxData[monthKey]),
      prec: Number(precData[monthKey]),
    };
  });
}

export function createWorldClimAuthHeaders(): { Authorization: string } {
  return {
    Authorization: `Bearer ${env.WORLDCLIM_API_KEY}`,
  };
}

export function buildGridIri(gridSize: TCellSize): string {
  return `${WORLDCLIM_GRID_BASE}${gridSize}`;
}

export function buildVariableIris(variables: readonly string[]): string[] {
  return variables.map((v) => `${WORLDCLIM_VARIABLE_BASE}${v}`);
}

export function buildDatasetParams(
  isClimate: boolean,
  year?: number,
): { isClimate: true } | { isWeather: true; year: number } {
  if (isClimate) {
    return { isClimate: true };
  }
  return { isWeather: true, year: year ?? new Date().getFullYear() };
}

export function validateResponseData(response: { data: unknown }): void {
  if (!response.data) {
    throw new Error("No data returned from API");
  }
}

export function buildMonthlyTemperaturesFromPointValues(
  bindings: TWorldClimPointValueBinding[],
): TMonthlyTemperature[] {
  const vals = new Map<string, number>();
  for (const b of bindings) {
    const varParts = b.var.value.split("Variable_");
    const varName = varParts[varParts.length - 1] ?? "";
    const monthNum = parseInt(b.month.value.replace("--", ""), 10);
    vals.set(`${varName}_${monthNum}`, Number(b.value.value));
  }
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: MONTH_NAMES[i],
    tmin: vals.get(`tmin_${i + 1}`) ?? 0,
    tmax: vals.get(`tmax_${i + 1}`) ?? 0,
    prec: vals.get(`prec_${i + 1}`) ?? 0,
  }));
}
