import type { computeCompareStats } from "@/pages/ClimateComparison/ClimateComparison.util";
import type { TCellSize, TMonthlyTemperature, TWikidataCity } from "@/types";

export type TComparePeriodsViewProps = {
  city: TWikidataCity;
  periodA: number;
  periodB: number;
  dataA: TMonthlyTemperature[];
  dataB: TMonthlyTemperature[];
  autoGrid: TCellSize;
  isLoading: boolean;
  error: Error | null;
  onCitySelect: (city: TWikidataCity) => void;
  onPeriodAChange: (year: number) => void;
  onPeriodBChange: (year: number) => void;
};

export type TCitySearchRowProps = {
  label: string;
  dotColor: string;
  onCitySelect: (city: TWikidataCity) => void;
};

export type TPeriodSelectRowProps = {
  label: string;
  dotColor: string;
  value: number;
  onChange: (year: number) => void;
};

export type TStatsGridProps = {
  labelA: string;
  labelB: string;
  statsA: ReturnType<typeof computeCompareStats>;
  statsB: ReturnType<typeof computeCompareStats>;
};

export type TDiffCardProps = {
  title: string;
  value: string;
  sub: string;
  valueColor?: string | undefined;
};
