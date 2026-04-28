import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  ComposedChart,
  Customized,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AridityLegend } from "./components/AridityLegend";
import { SummaryStats } from "./components/SummaryStats";
import { WLCustomized } from "./components/WLCustomized";
import { WLTooltip } from "./components/WLTooltip";
import type { TWLScaledPoint, TWalterLiethChartProps } from "./TempPrecipChart.type";
import { CHART_COLORS } from "./utils/chartColors";

export function WalterLiethChart({ chartData, scales, summary }: TWalterLiethChartProps) {
  const { t } = useTranslation();

  const scaledData: TWLScaledPoint[] = chartData.map((d) => ({
    monthName: typeof d["monthName"] === "string" ? d["monthName"] : "",
    tavg: Number(d["tavg"] ?? 0),
    prec: Number(d["prec"] ?? 0),
    precScaled: Number(d["prec"] ?? 0) / 2,
  }));

  return (
    <>
      {summary && <SummaryStats summary={summary} />}
      <div className="overflow-x-auto">
        <div className="h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px] min-w-[520px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={scaledData} margin={{ top: 20, right: 60, bottom: 50, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />

              <XAxis
                dataKey="monthName"
                interval={0}
                tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                label={{
                  value: t("chart.monthAxis"),
                  position: "insideBottom",
                  offset: -10,
                  fill: "var(--color-text-secondary)",
                  fontWeight: 600,
                }}
              />

              <YAxis
                yAxisId="left"
                domain={scales ? [scales.tempMin, scales.tempMax] : ["auto", "auto"]}
                tickFormatter={(v: unknown) => String(Math.round(Number(v)))}
                tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                label={{
                  value: "°C",
                  angle: -90,
                  position: "insideLeft",
                  offset: 12,
                  fill: "var(--color-text-secondary)",
                  fontWeight: 600,
                }}
              />

              {/* Right axis — mm reference only, no data series bound to it */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={scales ? [scales.precMin, scales.precMax] : [0, "auto"]}
                tickFormatter={(v: unknown) => String(Math.round(Number(v)))}
                tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                label={{
                  value: "mm",
                  angle: 90,
                  position: "insideRight",
                  offset: 12,
                  fill: "var(--color-text-secondary)",
                  fontWeight: 600,
                }}
              />

              <Tooltip content={<WLTooltip wlData={scaledData} />} />
              <Legend verticalAlign="bottom" height={48} wrapperStyle={{ paddingTop: 24 }} />

              {/* Invisible lines — legend entries only */}
              <Line
                yAxisId="left"
                dataKey="precScaled"
                name={t("chart.precipitation")}
                stroke={CHART_COLORS.wl.precStroke}
                strokeWidth={0}
                dot={false}
                legendType="square"
              />

              <Line
                yAxisId="left"
                dataKey="tavg"
                name={t("chart.avgTemperature")}
                stroke={CHART_COLORS.wl.tempStroke}
                strokeWidth={0}
                dot={false}
                legendType="line"
              />
              <Customized component={WLCustomized} wlData={scaledData} wlScales={scales} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <AridityLegend />
    </>
  );
}
