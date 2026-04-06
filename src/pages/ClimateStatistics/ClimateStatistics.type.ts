import type { TCellSize, TMonthlyTemperature } from "@/types/domain/climate";
import type { TCoordinates, TWikidataCity } from "@/types/domain/location";
import type { TCellSizeOption } from "@/types/ui/cell-size";

export type TClimateStatisticsViewProps = {
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
