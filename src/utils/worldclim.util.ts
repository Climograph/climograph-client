import { MONTH_NAMES, WORLDCLIM_GRID_BASE, WORLDCLIM_VARIABLE_BASE } from "@/constants";
import env from "@/env";
import type {
  TCellSize,
  TMonthlyTemperature,
  TWorldClimCellResponse,
  TWorldClimPixelResource,
  TWorldClimPointValueBinding,
} from "@/types";

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

/**
 * Creates authorization headers for WorldClim API requests
 * @returns Object with Authorization header using bearer token
 */
export function createWorldClimAuthHeaders(): { Authorization: string } {
  return {
    Authorization: `Bearer ${env.WORLDCLIM_API_KEY}`,
  };
}

/**
 * Builds a WorldClim grid IRI from a cell size
 * @param gridSize Grid resolution (e.g., "10m", "5m", "2.5m", "30s")
 * @returns Full grid IRI string
 */
export function buildGridIri(gridSize: TCellSize): string {
  return `${WORLDCLIM_GRID_BASE}${gridSize}`;
}

/**
 * Builds WorldClim variable IRIs from variable names
 * @param variables Array of variable names (e.g., ["tmax", "tmin", "prec"])
 * @returns Array of full variable IRI strings
 */
export function buildVariableIris(variables: readonly string[]): string[] {
  return variables.map((v) => `${WORLDCLIM_VARIABLE_BASE}${v}`);
}

/**
 * Builds dataset query parameters based on climate vs weather flag
 * @param isClimate Whether to query climate (1970-2000) or weather (1951-2024) data
 * @param year Optional year for weather dataset queries
 * @returns Object with dataset parameters for axios query
 */
export function buildDatasetParams(
  isClimate: boolean,
  year?: number,
): { isClimate: true } | { isWeather: true; year: number } {
  if (isClimate) {
    return { isClimate: true };
  }
  return { isWeather: true, year: year ?? new Date().getFullYear() };
}

/**
 * Validates that a response has data
 * @param response Response object with data property
 * @throws Error if response.data is falsy
 */
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
