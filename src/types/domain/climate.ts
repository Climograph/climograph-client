import { CELL_SIZES, DATASETS, SIDEBAR_VARIABLES } from "@/constants";

export type TCellSize = (typeof CELL_SIZES)[keyof typeof CELL_SIZES];
export type TDataset = (typeof DATASETS)[keyof typeof DATASETS];
export type TVariable = (typeof SIDEBAR_VARIABLES)[number];
export type TMonthFilter = number[] | "all";

export type TMonthlyTemperature = {
  month: number;
  monthName: string;
  tmin: number;
  tmax: number;
  prec: number;
};
