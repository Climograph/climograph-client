import type { TMonthlyTemperature } from "@/types";
import type { TMonthAridity, TWalterLiethScales } from "@/utils";
import type { ReactNode } from "react";

export type TVisibleSeries = {
  tmax: boolean;
  tmin: boolean;
  tavg: boolean;
  prec: boolean;
};

export type TChartMode = "standard" | "walter-lieth";

export type TTempPrecipChartProps = {
  data?: TMonthlyTemperature[];
  cityName?: string;
  selectedMonth?: number;
  dataA?: TMonthlyTemperature[];
  dataB?: TMonthlyTemperature[];
  labelA?: string;
  labelB?: string;
};

export type TBarShape = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  fill?: string;
  fillOpacity?: number;
  yAxis?: { scale?: (v: number) => number };
};

/**
 * All fields typed as T | undefined because recharts DotItemDotProps uses string | undefined
 * for some fields, and exactOptionalPropertyTypes requires explicit undefined unions.
 */
export type TDotRendererProps = {
  cx?: number | undefined;
  cy?: number | undefined;
  r?: number | string | undefined;
  fill?: string | undefined;
  stroke?: string | undefined;
  index?: number | undefined;
};

export type TComparePoint = {
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

export type TChartSummary = {
  annualAvgTemp: string;
  totalPrec: number;
  aridCount: number;
};

export type TSummaryStatsProps = {
  summary: TChartSummary;
};

export type TModeButtonProps = {
  isActive: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
};

export type TModeToggleProps = {
  mode: TChartMode;
  onChange: (mode: TChartMode) => void;
};

export type TWLScaledPoint = {
  monthName: string;
  tavg: number;
  prec: number;
  precScaled: number;
};

export type TWLCustomizedProps = {
  wlData: TWLScaledPoint[];
  wlScales: TWalterLiethScales | null;
};

export type TWLTooltipProps = {
  active?: boolean;
  label?: string;
  wlData?: TWLScaledPoint[];
};

export type TWalterLiethChartProps = {
  chartData: Record<string, unknown>[];
  scales: TWalterLiethScales | null;
  summary: TChartSummary | null;
};

export type TStandardClimateChartProps = {
  chartData: Record<string, unknown>[];
  aridity: TMonthAridity[] | null;
  aridityA: TMonthAridity[] | null;
  scales: TWalterLiethScales | null;
  rightMax: number;
  summary: TChartSummary | null;
  visible: TVisibleSeries;
  selectedMonth?: number;
  isCompare: boolean;
  labelA?: string;
  labelB?: string;
};
