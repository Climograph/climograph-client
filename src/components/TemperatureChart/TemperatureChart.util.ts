import type { TMonthlyTemperature } from "@/types/domain/climate";
import { TEMPERATURE_CHART_COLORS } from "./TemperatureChart.constant";
import type { TemperatureChartSeries } from "./TemperatureChart.type";

export const chartData = (data: TMonthlyTemperature[]): TemperatureChartSeries[] => [
  {
    id: "Max Temperature",
    color: TEMPERATURE_CHART_COLORS.MAX,
    data: data.map((d) => ({ x: d.monthName, y: d.tmax })),
  },
  {
    id: "Min Temperature",
    color: TEMPERATURE_CHART_COLORS.MIN,
    data: data.map((d) => ({ x: d.monthName, y: d.tmin })),
  },
];
