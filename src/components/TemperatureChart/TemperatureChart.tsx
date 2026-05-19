import { ResponsiveLine } from "@nivo/line";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TEMPERATURE_CHART_COLORS } from "./TemperatureChart.constant";
import type { TemperatureChartProps } from "./TemperatureChart.type";
import {
  chartData,
  getAxisBottom,
  getChartLegends,
  getChartMargin,
  getChartTheme,
} from "./TemperatureChart.util";

export function TemperatureChart({ data, cityName }: TemperatureChartProps) {
  const { t } = useTranslation();
  const [isSmallScreen, setIsSmallScreen] = useState(
    () => window.matchMedia("(max-width: 640px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const update = (e: MediaQueryListEvent) => setIsSmallScreen(e.matches);
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const minTemp = useMemo(() => {
    if (!data.length) return 0;
    return Math.floor(data.reduce((acc, d) => (d.tmin < acc ? d.tmin : acc), data[0].tmin) - 2);
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div
      className={`
        p-4 w-full
        bg-[var(--color-bg)] 
        border border-[var(--color-border)] 
        rounded-[var(--radius-lg)] 
        shadow-sm overflow-hidden
      `}
    >
      <h3
        className={`
          mb-2 
          font-semibold text-[length:var(--font-md)] md:text-[length:var(--font-lg)] 
          text-[var(--color-text)] text-center truncate
        `}
      >
        {t("chart.title")}: {cityName}
      </h3>
      <div className={`h-[280px] xs:h-[320px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-full`}>
        <ResponsiveLine
          data={chartData(data, t)}
          margin={getChartMargin(isSmallScreen)}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: minTemp, max: "auto", stacked: false, nice: 2 }}
          curve="monotoneX"
          axisBottom={getAxisBottom(isSmallScreen, t("chart.monthAxis"))}
          axisLeft={{
            legend: t("chart.temperatureAxis"),
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
          legends={getChartLegends(isSmallScreen)}
          theme={getChartTheme(isSmallScreen)}
        />
      </div>
    </div>
  );
}
