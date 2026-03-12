import type { TCellSize, TMonthlyTemperature } from "./climate.type";
import type { TCoordinates } from "./common.type";
import type { TWikidataCity } from "./wikidata.type";

export type TCellSizeOption = {
  value: TCellSize;
  label: string;
};

export type TSearchBarProps = {
  onCitySelect: (city: TWikidataCity) => void;
};

export type TLeafletMapProps = {
  lat: number;
  lng: number;
  label?: string;
};

export type TMapUpdaterProps = {
  lat: number;
  lng: number;
};

export type TemperatureChartProps = {
  data: TMonthlyTemperature[];
  cityName: string;
};

export type TemperatureChartPoint = {
  x: string;
  y: number;
};

export type TemperatureChartSeries = {
  id: string;
  color: string;
  data: TemperatureChartPoint[];
};

export type TCellSizeSelectorProps = {
  activeSize: TCellSize;
  options: readonly TCellSizeOption[];
  onSelect: (size: TCellSize) => void;
};

export type THomePageViewProps = {
  selectedCity: TWikidataCity | null;
  mapCenter: TCoordinates;
  cellSize: TCellSize;
  cellSizeOptions: readonly TCellSizeOption[];
  temperatureData: TMonthlyTemperature[];
  isLoading: boolean;
  error: string | null;
  onCitySelect: (city: TWikidataCity) => void;
  onCellSizeChange: (size: TCellSize) => void;
};
