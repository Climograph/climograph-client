import { computeAridityPeriods, getWalterLiethScales } from "@/utils";
import { useMemo } from "react";
import type { TMonthlyTemperatureWithAvg, TTempPrecipChartProps } from "../TempPrecipChart.type";
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

  const aridityB = useMemo(
    () => (isCompare && dataB?.length ? computeAridityPeriods(dataB) : null),
    [dataB, isCompare],
  );

  const scalesData = useMemo(
    () => (isCompare ? [...(dataA ?? []), ...(dataB ?? [])] : (data ?? [])),
    [data, dataA, dataB, isCompare],
  );

  const scales = useMemo(
    () => (scalesData.length ? getWalterLiethScales(scalesData) : null),
    [scalesData],
  );

  const chartDataSingle = useMemo<TMonthlyTemperatureWithAvg[]>(
    () => (data ?? []).map((d) => ({ ...d, tavg: (d.tmax + d.tmin) / 2 })),
    [data],
  );

  const chartData = useMemo<Record<string, unknown>[]>(
    () => (isCompare ? buildCompareData(dataA ?? [], dataB ?? []) : chartDataSingle),
    [chartDataSingle, dataA, dataB, isCompare],
  );

  const summary = useMemo(
    () => (aridity && data ? computeChartSummary(data, aridity) : null),
    [aridity, data],
  );

  const chartDataA = useMemo<TMonthlyTemperatureWithAvg[]>(
    () => (isCompare ? (dataA ?? []).map((d) => ({ ...d, tavg: (d.tmax + d.tmin) / 2 })) : []),
    [dataA, isCompare],
  );

  const chartDataB = useMemo<TMonthlyTemperatureWithAvg[]>(
    () => (isCompare ? (dataB ?? []).map((d) => ({ ...d, tavg: (d.tmax + d.tmin) / 2 })) : []),
    [dataB, isCompare],
  );

  const summaryA = useMemo(
    () => (aridityA && dataA ? computeChartSummary(dataA, aridityA) : null),
    [aridityA, dataA],
  );

  const summaryB = useMemo(
    () => (aridityB && dataB ? computeChartSummary(dataB, aridityB) : null),
    [aridityB, dataB],
  );

  const rightMax = useMemo(() => {
    const precValues = isCompare
      ? [...(dataA ?? []), ...(dataB ?? [])].map((d) => d.prec)
      : (data ?? []).map((d) => d.prec);

    const max = precValues.length ? Math.max(...precValues) : 0;

    return Math.ceil(max / 10) * 10 || 100;
  }, [data, dataA, dataB, isCompare]);

  return {
    isCompare,
    hasData,
    aridity,
    aridityA,
    scales,
    chartData,
    chartDataSingle,
    chartDataA,
    chartDataB,
    summary,
    summaryA,
    summaryB,
    rightMax,
  };
}
