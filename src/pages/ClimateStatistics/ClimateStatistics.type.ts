import type { TCellSize, TCoordinates, TMonthlyTemperature, TWikidataCity } from "@/types";

export type TClimateStatisticsViewProps = {
  selectedCity: TWikidataCity | null;
  mapCenter: TCoordinates;
  temperatureData: TMonthlyTemperature[];
  cellSize: TCellSize;
  isAutoResolution: boolean;
  selectedMonths: number[] | null;
  isLoading: boolean;
  isFetching: boolean;
  isLocating: boolean;
  error: string | null;
  locationError: string | null;
  onCitySelect: (city: TWikidataCity) => void;
  onMapClick: (lat: number, lng: number) => void;
  onLocate: () => void;
};

export type TStatCardProps = {
  label: string;
  value: string;
  unit?: string;
  tooltip?: string;
};
