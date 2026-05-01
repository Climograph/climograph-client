import { CELL_SIZES, DATASETS } from "@/constants";
import type { TClimateVariable, TWeatherVariable } from "@/constants/worldclim.constant";

export type TCellSize = (typeof CELL_SIZES)[keyof typeof CELL_SIZES];
export type TDataset = (typeof DATASETS)[keyof typeof DATASETS];
export type { TClimateVariable, TWeatherVariable };
export type TVariable = TClimateVariable | TWeatherVariable;
export type TMonthFilter = number[] | "all";

export type TMonthlyTemperature = {
  month: number;
  monthName: string;
  tmin: number;
  tmax: number;
  prec: number;
};
