import type { TClimatePeriod } from "@/constants/worldclim.constant";
import type { TCellSize, TDataset, TMonthlyTemperature, TWikidataCity } from "@/types";

export type TComparePeriodsViewProps = {
  city: TWikidataCity;
  dataset: TDataset;
  selectedMonths: number[] | null;
  altitude: number | null;
  climatePeriodA: TClimatePeriod;
  climatePeriodB: TClimatePeriod;
  yearA: number;
  yearB: number;
  dataA: TMonthlyTemperature[];
  dataB: TMonthlyTemperature[];
  autoGrid: TCellSize;
  isLoading: boolean;
  isLocating: boolean;
  error: Error | null;
  locationError: string | null;
  onCitySelect: (city: TWikidataCity) => void;
  onLocate: () => void;
  onClearLocationError: () => void;
  onClimatePeriodAChange: (period: TClimatePeriod) => void;
  onClimatePeriodBChange: (period: TClimatePeriod) => void;
  onYearAChange: (year: number) => void;
  onYearBChange: (year: number) => void;
};

export type TClimatePeriodRowProps = {
  label: string;
  dotColor: string;
  value: TClimatePeriod;
  onChange: (period: TClimatePeriod) => void;
};
