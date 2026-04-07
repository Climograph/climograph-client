import { useTranslation } from "react-i18next";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TTempPrecipChartProps } from "./TempPrecipChart.type";

export default function TempPrecipChart({ data, cityName }: TTempPrecipChartProps) {
  const { t } = useTranslation();

  if (data.length === 0) return null;

  const minTemp = Math.floor(
    data.reduce((acc, d) => (d.tmin < acc ? d.tmin : acc), data[0].tmin) - 2,
  );

  return (
    <div className="p-4 w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden">
      <h3 className="mb-4 font-semibold text-[length:var(--font-md)] md:text-[length:var(--font-lg)] text-[var(--color-text)] text-center truncate">
        {t("chart.title")}: {cityName}
      </h3>

      <div className="h-[280px] xs:h-[320px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 60, bottom: 50, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />

            <XAxis
              dataKey="monthName"
              tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
              label={{
                value: t("chart.monthAxis"),
                position: "insideBottom",
                offset: -10,
                fill: "var(--color-text-secondary)",
                fontWeight: 600,
              }}
            />

            {/* Ліва вісь — температура °C */}
            <YAxis
              yAxisId="temp"
              domain={[minTemp, "auto"]}
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

            {/* Права вісь — опади мм */}
            <YAxis
              yAxisId="prec"
              orientation="right"
              tick={{ fontSize: 12, fill: "#3b82f6" }}
              label={{
                value: "мм",
                angle: 90,
                position: "insideRight",
                offset: 12,
                fill: "#3b82f6",
                fontWeight: 600,
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
              }}
              formatter={(value, name) => {
                const normalizedValue = Array.isArray(value)
                  ? value.join(", ")
                  : String(value ?? "");
                return [
                  name === t("chart.precipitation")
                    ? `${normalizedValue} мм`
                    : `${normalizedValue} °C`,
                  name,
                ];
              }}
            />

            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: 16 }} />

            {/* Спочатку бари — щоб були позаду ліній */}
            <Bar
              yAxisId="prec"
              dataKey="prec"
              name={t("chart.precipitation")}
              fill="#93c5fd"
              opacity={0.75}
              radius={[2, 2, 0, 0]}
            />

            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="tmax"
              name={t("chart.maxTemperature")}
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="tmin"
              name={t("chart.minTemperature")}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
