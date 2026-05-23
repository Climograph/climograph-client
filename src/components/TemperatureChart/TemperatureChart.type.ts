import type { TMonthlyTemperature } from "@/types/domain/climate";

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
