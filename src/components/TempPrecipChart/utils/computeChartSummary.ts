import type { TMonthlyTemperature } from "@/types";
import type { TMonthAridity } from "@/utils";
import type { TChartSummary } from "../TempPrecipChart.type";

export function computeChartSummary(
  data: TMonthlyTemperature[],
  aridity: TMonthAridity[],
): TChartSummary {
  const avgTemp = aridity.reduce((s, m) => s + m.tavg, 0) / aridity.length;

  return {
    annualAvgTemp: avgTemp.toFixed(1),
    totalPrec: Math.round(data.reduce((s, d) => s + d.prec, 0)),
    aridCount: aridity.filter((m) => m.isArid).length,
  };
}
