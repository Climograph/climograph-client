import type {
  TCellSize,
  TCellSizeOption,
  TCoordinates,
  TMonthlyTemperature,
  TWikidataCity,
} from "@/types";

export type TClimateStatisticsViewProps = {
  selectedCity: TWikidataCity | null;
  mapCenter: TCoordinates;
  cellSize: TCellSize;
  cellSizeOptions: readonly TCellSizeOption[];
  temperatureData: TMonthlyTemperature[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  onCitySelect: (city: TWikidataCity) => void;
  onMapClick: (lat: number, lng: number) => void;
  onCellSizeChange: (size: TCellSize) => void;
};
