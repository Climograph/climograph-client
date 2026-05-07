import type { TChartSubtitle } from "@/components/TempPrecipChart/TempPrecipChart.type";
import type { TCoordinates, TMonthlyTemperature, TWikidataCity } from "@/types";

export type TClimateStatisticsViewProps = {
  selectedCity: TWikidataCity | null;
  mapCenter: TCoordinates;
  temperatureData: TMonthlyTemperature[];
  cityName: string;
  subtitle: TChartSubtitle;
  altitude: number | null;
  selectedMonths: number[] | null;
  isLoading: boolean;
  isFetching: boolean;
  isLocating: boolean;
  error: string | null;
  locationError: string | null;
  onCitySelect: (city: TWikidataCity) => void;
  onMapClick: (lat: number, lng: number) => void;
  onLocate: () => void;
  onClearLocationError: () => void;
};

export type TStatCardProps = {
  label: string;
  value: string;
  unit?: string;
  tooltip?: string;
};
