import { CELL_SIZES } from "@/constants/worldclim.constant";

export type TSparqlValue = {
  type: string;
  value: string;
};

export type TWorldClimCellBinding = {
  cell: TSparqlValue;
  grid: TSparqlValue;
};

export type TWorldClimCellResponseResults = {
  distinct: boolean;
  ordered: boolean;
  bindings: TWorldClimCellBinding[];
};

export type TWorldClimCellResponse = {
  head: { vars: string[] };
  results: TWorldClimCellResponseResults;
};

export type TWorldClimTemperatureBinding = {
  month: TSparqlValue;
  tmin: TSparqlValue;
  tmax: TSparqlValue;
};

export type TWorldClimTemperatureResponse = {
  head: { vars: string[] };
  results: TWorldClimTemperatureResponseResults;
};

export type TWorldClimTemperatureResponseResults = {
  distinct: boolean;
  ordered: boolean;
  bindings: TWorldClimTemperatureBinding[];
};

export type TCellSize = (typeof CELL_SIZES)[keyof typeof CELL_SIZES];

export type TMonthlyTemperature = {
  month: number;
  monthName: string;
  tmin: number;
  tmax: number;
};
