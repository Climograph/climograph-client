import type { TClimatePeriod } from "@/constants/worldclim.constant";
import type { computeCompareStats } from "@/pages/ClimateComparison/ClimateComparison.util";
import type { TCellSize, TDataset, TMonthlyTemperature, TWikidataCity } from "@/types";

export type TComparePeriodsViewProps = {
  city: TWikidataCity;
  dataset: TDataset;
  climatePeriodA: TClimatePeriod;
  climatePeriodB: TClimatePeriod;
  yearA: number;
  yearB: number;
  dataA: TMonthlyTemperature[];
  dataB: TMonthlyTemperature[];
  autoGrid: TCellSize;
  isLoading: boolean;
  error: Error | null;
  onCitySelect: (city: TWikidataCity) => void;
  onClimatePeriodAChange: (period: TClimatePeriod) => void;
  onClimatePeriodBChange: (period: TClimatePeriod) => void;
  onYearAChange: (year: number) => void;
  onYearBChange: (year: number) => void;
};

export type TCitySearchRowProps = {
  label: string;
  dotColor: string;
  onCitySelect: (city: TWikidataCity) => void;
};

export type TClimatePeriodRowProps = {
  label: string;
  dotColor: string;
  value: TClimatePeriod;
  onChange: (period: TClimatePeriod) => void;
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
