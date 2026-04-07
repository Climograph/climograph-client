import { MONTH_NAMES } from "@/constants";
import type {
  TCellSize,
  TMonthlyTemperature,
  TWorldClimCellResponse,
  TWorldClimPixelResource,
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
