import { CELL_SIZES } from "@/constants/worldclim.constant";

export type TCellSize = (typeof CELL_SIZES)[keyof typeof CELL_SIZES];

export type TMonthlyTemperature = {
  month: number;
  monthName: string;
  tmin: number;
  tmax: number;
};
