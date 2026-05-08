import type { TMonthlyTemperature } from "@/types";

export type TCompareStats = {
  avgTmax: number;
  avgTmin: number;
  totalPrec: number;
};

export type TCompareChartPoint = {
  monthName: string;
  tmaxA: number;
  tminA: number;
  tavgA: number;
  precA: number;
  tmaxB: number;
  tminB: number;
  tavgB: number;
  precB: number;
};

export type TDiffStats = {
  warmerCity: "A" | "B" | "tie";
  tmaxDiff: number;
  moreRainCity: "A" | "B" | "tie";
  precDiff: number;
  hottestMonthName: string;
  hottestTempA: number;
  hottestTempB: number;
  coldestMonthName: string;
  coldestTempA: number;
  coldestTempB: number;
};

export function computeCompareStats(data: TMonthlyTemperature[]): TCompareStats {
  const count = data.length;
  if (count === 0) return { avgTmax: 0, avgTmin: 0, totalPrec: 0 };
  return {
    avgTmax: data.reduce((s, d) => s + d.tmax, 0) / count,
    avgTmin: data.reduce((s, d) => s + d.tmin, 0) / count,
    totalPrec: data.reduce((s, d) => s + d.prec, 0),
  };
}

export function buildCompareChartData(
  cityA: TMonthlyTemperature[],
  cityB: TMonthlyTemperature[],
): TCompareChartPoint[] {
  return cityA.map((a, i) => {
    const b = cityB[i] ?? { tmax: 0, tmin: 0, prec: 0 };
    return {
      monthName: a.monthName,
      tmaxA: a.tmax,
      tminA: a.tmin,
      tavgA: (a.tmax + a.tmin) / 2,
      precA: a.prec,
      tmaxB: b.tmax,
      tminB: b.tmin,
      tavgB: (b.tmax + b.tmin) / 2,
      precB: b.prec,
    };
  });
}

export function computeDiffStats(
  cityA: TMonthlyTemperature[],
  cityB: TMonthlyTemperature[],
): TDiffStats {
  const statsA = computeCompareStats(cityA);
  const statsB = computeCompareStats(cityB);

  const warmerCity: "A" | "B" | "tie" =
    statsA.avgTmax > statsB.avgTmax ? "A" : statsA.avgTmax < statsB.avgTmax ? "B" : "tie";

  const moreRainCity: "A" | "B" | "tie" =
    statsA.totalPrec > statsB.totalPrec ? "A" : statsA.totalPrec < statsB.totalPrec ? "B" : "tie";

  let hottestIdx = 0;
  let hottestPeak = -Infinity;
  let coldestIdx = 0;
  let coldestTrough = Infinity;

  for (let i = 0; i < cityA.length; i++) {
    const bEntry = cityB[i];
    const peak = Math.max(cityA[i].tmax, bEntry?.tmax ?? -Infinity);
    if (peak > hottestPeak) {
      hottestPeak = peak;
      hottestIdx = i;
    }
    const trough = Math.min(cityA[i].tmin, bEntry?.tmin ?? Infinity);
    if (trough < coldestTrough) {
      coldestTrough = trough;
      coldestIdx = i;
    }
  }

  return {
    warmerCity,
    tmaxDiff: Math.abs(statsA.avgTmax - statsB.avgTmax),
    moreRainCity,
    precDiff: Math.abs(statsA.totalPrec - statsB.totalPrec),
    hottestMonthName: cityA[hottestIdx]?.monthName ?? "",
    hottestTempA: cityA[hottestIdx]?.tmax ?? 0,
    hottestTempB: cityB[hottestIdx]?.tmax ?? 0,
    coldestMonthName: cityA[coldestIdx]?.monthName ?? "",
    coldestTempA: cityA[coldestIdx]?.tmin ?? 0,
    coldestTempB: cityB[coldestIdx]?.tmin ?? 0,
  };
}

export const CLIMATE_COMPARISON_COLORS = {
  A: { tmax: "#1D9E75", tmin: "#5DCAA5", prec: "#9FE1CB" },
  B: { tmax: "#D97706", tmin: "#F59E0B", prec: "#FCD34D" },
} as const;
