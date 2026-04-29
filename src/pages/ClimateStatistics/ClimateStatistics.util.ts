import type { TCellSize, TMonthlyTemperature } from "@/types";

export function toCityQueryParam(cityLabel: string) {
  return cityLabel.trim().toLowerCase();
}

export function formatCoordinate(value: number) {
  return value.toFixed(4);
}

export type TClimateStats = {
  avgTmax: string;
  avgTmin: string;
  totalPrec: string;
  resolution: TCellSize;
};

export function computeClimateStats(
  data: TMonthlyTemperature[],
  resolution: TCellSize,
  month?: number | null,
): TClimateStats {
  if (month !== undefined && month !== null) {
    const m = data.find((d) => d.month === month);
    return {
      avgTmax: m !== undefined ? m.tmax.toFixed(1) : "—",
      avgTmin: m !== undefined ? m.tmin.toFixed(1) : "—",
      totalPrec: m !== undefined ? m.prec.toFixed(0) : "—",
      resolution,
    };
  }

  const count = data.length;
  const avgTmax = count > 0 ? (data.reduce((sum, d) => sum + d.tmax, 0) / count).toFixed(1) : "—";
  const avgTmin = count > 0 ? (data.reduce((sum, d) => sum + d.tmin, 0) / count).toFixed(1) : "—";
  const totalPrec = count > 0 ? data.reduce((sum, d) => sum + d.prec, 0).toFixed(0) : "—";

  return { avgTmax, avgTmin, totalPrec, resolution };
}
