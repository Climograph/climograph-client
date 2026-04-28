import { computeAridityPeriods, getWalterLiethScales } from "@/utils";
import { useMemo } from "react";
import type { TTempPrecipChartProps } from "../TempPrecipChart.type";
import { buildCompareData } from "../utils/buildCompareData";
import { computeChartSummary } from "../utils/computeChartSummary";

export function useTempPrecipChart({ data, dataA, dataB }: TTempPrecipChartProps) {
  const isCompare = dataA !== undefined;

  const hasData = useMemo(
    () =>
      isCompare ? (dataA?.length ?? 0) > 0 || (dataB?.length ?? 0) > 0 : (data?.length ?? 0) > 0,
    [data, dataA, dataB, isCompare],
  );

  const aridity = useMemo(
    () => (!isCompare && data?.length ? computeAridityPeriods(data) : null),
    [data, isCompare],
  );

  const aridityA = useMemo(
    () => (isCompare && dataA?.length ? computeAridityPeriods(dataA) : null),
    [dataA, isCompare],
  );

  const scalesData = useMemo(
    () => (isCompare ? [...(dataA ?? []), ...(dataB ?? [])] : (data ?? [])),
    [data, dataA, dataB, isCompare],
  );

  const scales = useMemo(
    () => (scalesData.length ? getWalterLiethScales(scalesData) : null),
    [scalesData],
  );

  const chartData = useMemo<Record<string, unknown>[]>(
    () =>
      isCompare
        ? buildCompareData(dataA ?? [], dataB ?? [])
        : (data ?? []).map((d) => ({ ...d, tavg: (d.tmax + d.tmin) / 2 })),
    [data, dataA, dataB, isCompare],
  );

  const summary = useMemo(
    () => (aridity && data ? computeChartSummary(data, aridity) : null),
    [aridity, data],
  );

  const rightMax = useMemo(() => {
    const precValues = isCompare
      ? [...(dataA ?? []), ...(dataB ?? [])].map((d) => d.prec)
      : (data ?? []).map((d) => d.prec);

    const max = precValues.length ? Math.max(...precValues) : 0;

    return Math.ceil(max / 10) * 10 || 100;
  }, [data, dataA, dataB, isCompare]);

  return { isCompare, hasData, aridity, aridityA, scales, chartData, summary, rightMax };
}
