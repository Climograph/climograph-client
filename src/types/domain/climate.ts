import { CELL_SIZES, DATASETS, SIDEBAR_VARIABLES } from "@/constants";

export type TCellSize = (typeof CELL_SIZES)[keyof typeof CELL_SIZES];
export type TDataset = (typeof DATASETS)[keyof typeof DATASETS];
export type TVariable = (typeof SIDEBAR_VARIABLES)[number];
export type TMonthFilter =
  | "all"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12";

export type TMonthlyTemperature = {
  month: number;
  monthName: string;
  tmin: number;
  tmax: number;
  prec: number;
};
