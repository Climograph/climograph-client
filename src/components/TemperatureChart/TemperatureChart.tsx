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
        ? { top: 30, right: 24, bottom: 110, left: 54 }
        : { top: 30, right: 48, bottom: 90, left: 64 },
    [isSmallScreen],
  );

  const chartLegends = useMemo(
    () =>
      isSmallScreen
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
          ],
    [isSmallScreen],
  );

  const minTemp = useMemo(() => {
    if (!data.length) return 0;
    const min = data.reduce((acc, d) => (d.tmin < acc ? d.tmin : acc), data[0]?.tmin ?? 0);
    return Math.floor(min - 2);
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-sm w-full overflow-hidden">
      <h3 className="mb-2 font-semibold text-[length:var(--font-md)] md:text-[length:var(--font-lg)] text-[var(--color-text)] text-center truncate">
        Temperature — {cityName}
      </h3>

      <div className="h-[280px] xs:h-[320px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-full">
        <ResponsiveLine
          data={chartData(data)}
          margin={chartMargin}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: minTemp,
            max: "auto",
            stacked: false,
            nice: 2,
          }}
          curve="monotoneX"
          axisBottom={{
            legend: "Month",
            tickRotation: isSmallScreen ? -45 : 0,
            tickPadding: isSmallScreen ? 10 : 5,
            legendOffset: isSmallScreen ? 70 : 60,
            legendPosition: "middle",
          }}
          axisLeft={{
            legend: "Temperature (°C)",
            legendOffset: isSmallScreen ? -42 : -52,
            legendPosition: "middle",
            tickSize: 4,
          }}
          areaBaselineValue={0}
          colors={[TEMPERATURE_CHART_COLORS.MAX, TEMPERATURE_CHART_COLORS.MIN]}
          pointSize={isSmallScreen ? 4 : 8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          enableArea={true}
          areaOpacity={0.1}
          useMesh={true}
          enableSlices="x"
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
