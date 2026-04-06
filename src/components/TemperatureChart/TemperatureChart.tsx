import { ResponsiveLine } from "@nivo/line";
import { useEffect, useMemo, useState } from "react";
import { TEMPERATURE_CHART_COLORS } from "./TemperatureChart.constant";
import type { TemperatureChartProps } from "./TemperatureChart.type";
import { chartData } from "./TemperatureChart.util";

export function TemperatureChart({ data, cityName }: TemperatureChartProps) {
  const [isSmallScreen, setIsSmallScreen] = useState(
    () => window.matchMedia("(max-width: 640px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const update = (event: MediaQueryListEvent) => setIsSmallScreen(event.matches);

    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const chartMargin = useMemo(
    () =>
      isSmallScreen
        ? { top: 20, right: 20, bottom: 110, left: 50 }
        : { top: 20, right: 20, bottom: 90, left: 60 },
    [isSmallScreen],
  );

  const chartLegends = useMemo(
    () =>
      isSmallScreen
        ? [
            {
              anchor: "bottom",
              direction: "row",
              translateY: 110,
              itemWidth: 118,
              itemHeight: 18,
              symbolSize: 12,
              symbolShape: "square",
              symbolSpacing: 6,
              itemsSpacing: 4,
              itemDirection: "left-to-right",
            } as const,
          ]
        : [
            {
              anchor: "bottom-left",
              direction: "row",
              translateY: 80,
              itemWidth: 150,
              itemHeight: 18,
              symbolSize: 16,
              symbolShape: "square",
              symbolSpacing: 8,
              itemsSpacing: 6,
              itemDirection: "left-to-right",
            } as const,
          ],
    [isSmallScreen],
  );

  if (data.length === 0) return null;

  return (
    <div
      className={`
        p-4
        bg-[var(--color-bg)] 
        border border-[var(--color-border)] 
        rounded-[var(--radius-lg)]  
        shadow-sm
      `}
    >
      <h3
        className={`
          mb-2
          font-semibold
          text-[length:var(--font-md)] md:text-[length:var(--font-lg)] text-[var(--color-text)] text-center
        `}
      >
        Temperature — {cityName}
      </h3>

      <div className={`h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]`}>
        <ResponsiveLine
          data={chartData(data)}
          margin={chartMargin}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            stacked: false,
          }}
          axisBottom={{
            legend: "Month",
            tickRotation: isSmallScreen ? -45 : 0,
            tickPadding: isSmallScreen ? 10 : 5,
            legendOffset: isSmallScreen ? 70 : 60,
            legendPosition: "middle",
          }}
          axisLeft={{
            legend: "Temperature (°C)",
            legendOffset: isSmallScreen ? -40 : -50,
            legendPosition: "middle",
          }}
          colors={[TEMPERATURE_CHART_COLORS.MAX, TEMPERATURE_CHART_COLORS.MIN]}
          pointSize={isSmallScreen ? 4 : 8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          enableArea={true}
          areaOpacity={0.1}
          useMesh={true}
          legends={chartLegends}
          theme={{
            axis: {
              ticks: { text: { fill: TEMPERATURE_CHART_COLORS.AXIS_TICKS } },
              legend: {
                text: {
                  fill: TEMPERATURE_CHART_COLORS.AXIS_LEGEND,
                  fontWeight: 600,
                  fontSize: isSmallScreen ? "var(--font-xs)" : "var(--font-md)",
                },
              },
            },
            legends: {
              text: {
                fontSize: isSmallScreen ? "var(--font-xs)" : "var(--font-sm)",
              },
            },
            grid: { line: { stroke: TEMPERATURE_CHART_COLORS.GRID } },
          }}
        />
      </div>
    </div>
  );
}
