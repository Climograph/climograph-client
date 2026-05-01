import type { TCellSize, TMonthlyTemperature, TWikidataCity } from "@/types";
import { computeCompareStats } from "./ClimateComparison.util";

export type TComparisonMode = "cities" | "periods";

export type TClimateComparisonViewProps = {
  comparisonMode: TComparisonMode;
  cityA: TWikidataCity;
  cityB: TWikidataCity;
  periodA: number;
  periodB: number;
  dataA: TMonthlyTemperature[];
  dataB: TMonthlyTemperature[];
  autoGrid: TCellSize;
  isLoading: boolean;
  error: Error | null;
  onComparisonModeChange: (mode: TComparisonMode) => void;
  onCityASelect: (city: TWikidataCity) => void;
  onCityBSelect: (city: TWikidataCity) => void;
  onPeriodAChange: (year: number) => void;
  onPeriodBChange: (year: number) => void;
};

export type TPeriodSelectRowProps = {
  label: string;
  dotColor: string;
  value: number;
  onChange: (year: number) => void;
};

export type TCitySearchRowProps = {
  label: string;
  dotColor: string;
  onCitySelect: (city: TWikidataCity) => void;
};

export type TModeToggleProps = {
  mode: TComparisonMode;
  onModeChange: (mode: TComparisonMode) => void;
};

export type TStatsGridProps = {
  labelA: string;
  labelB: string;
  statsA: ReturnType<typeof computeCompareStats>;
  statsB: ReturnType<typeof computeCompareStats>;
  activeColumn?: number | undefined;
};

export type TDiffCardProps = {
  title: string;
  value: string;
  sub: string;
  valueColor?: string | undefined;
};
