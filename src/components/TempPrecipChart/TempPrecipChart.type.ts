import type { TMonthlyTemperature } from "@/types/domain/climate";

export type TTempPrecipChartProps = {
  data: TMonthlyTemperature[];
  cityName: string;
};

export type TTempPrecipChartPoint = {
  x: string;
  y: number;
};

export type TTempPrecipChartSeries = {
  id: string;
  color: string;
  data: TTempPrecipChartPoint[];
};
