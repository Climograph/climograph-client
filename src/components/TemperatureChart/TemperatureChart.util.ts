import type { TMonthlyTemperature } from "@/types/domain/climate";
import type { TFunction } from "i18next";
import { TEMPERATURE_CHART_COLORS } from "./TemperatureChart.constant";
import type { TemperatureChartSeries } from "./TemperatureChart.type";

export const chartData = (data: TMonthlyTemperature[], t: TFunction): TemperatureChartSeries[] => [
  {
    id: t("chart.maxTemperature"),
    color: TEMPERATURE_CHART_COLORS.MAX,
    data: data.map((d) => ({ x: d.monthName, y: d.tmax })),
  },
  {
    id: t("chart.minTemperature"),
    color: TEMPERATURE_CHART_COLORS.MIN,
    data: data.map((d) => ({ x: d.monthName, y: d.tmin })),
  },
];

export const getChartMargin = (isSmall: boolean) =>
  isSmall
    ? { top: 30, right: 24, bottom: 110, left: 54 }
    : { top: 30, right: 48, bottom: 90, left: 64 };

export const getChartLegends = (isSmall: boolean) =>
  isSmall
    ? [
        {
          anchor: "bottom" as const,
          direction: "row" as const,
          translateY: 110,
          itemWidth: 118,
          itemHeight: 18,
          symbolSize: 12,
          symbolShape: "square" as const,
          symbolSpacing: 6,
          itemsSpacing: 4,
          itemDirection: "left-to-right" as const,
        },
      ]
    : [
        {
          anchor: "bottom-left" as const,
          direction: "row" as const,
          translateY: 80,
          itemWidth: 150,
          itemHeight: 18,
          symbolSize: 16,
          symbolShape: "square" as const,
          symbolSpacing: 8,
          itemsSpacing: 6,
          itemDirection: "left-to-right" as const,
        },
      ];

export const getChartTheme = (isSmall: boolean) => ({
  axis: {
    ticks: { text: { fill: TEMPERATURE_CHART_COLORS.AXIS_TICKS } },
    legend: {
      text: {
        fill: TEMPERATURE_CHART_COLORS.AXIS_LEGEND,
        fontWeight: 600,
        fontSize: isSmall ? "var(--font-xs)" : "var(--font-md)",
      },
    },
  },
  legends: { text: { fontSize: isSmall ? "var(--font-xs)" : "var(--font-sm)" } },
  grid: { line: { stroke: TEMPERATURE_CHART_COLORS.GRID } },
});

export const getAxisBottom = (isSmall: boolean, monthLabel: string) => ({
  legend: monthLabel,
  tickRotation: isSmall ? -45 : 0,
  tickPadding: isSmall ? 10 : 5,
  legendOffset: isSmall ? 70 : 60,
  legendPosition: "middle" as const,
});
