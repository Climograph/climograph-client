import type { computeCompareStats } from "@/pages/ClimateComparison/ClimateComparison.util";
import type { TCellSize, TMonthlyTemperature, TWikidataCity } from "@/types";

export type TCompareCitiesViewProps = {
  cityA: TWikidataCity;
  cityB: TWikidataCity;
  dataA: TMonthlyTemperature[];
  dataB: TMonthlyTemperature[];
  autoGrid: TCellSize;
  isLoading: boolean;
  error: Error | null;
  onCityASelect: (city: TWikidataCity) => void;
  onCityBSelect: (city: TWikidataCity) => void;
};

export type TCitySearchRowProps = {
  label: string;
  dotColor: string;
  onCitySelect: (city: TWikidataCity) => void;
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
