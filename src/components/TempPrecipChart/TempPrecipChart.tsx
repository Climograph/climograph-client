import type { TMonthlyTemperature } from "@/types";
import type { TMonthAridity, TWalterLiethScales } from "@/utils";
import { computeAridityPeriods, getWalterLiethScales } from "@/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Customized,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  useXAxisScale,
  useYAxisScale,
  XAxis,
  YAxis,
} from "recharts";
import { FilterChip } from "../FilterChip";
import type { TChartMode, TTempPrecipChartProps, TVisibleSeries } from "./TempPrecipChart.type";

const ARID_COLOR = "#FCD34D";
const HUMID_COLOR = "#93C5FD";
const COLOR_SINGLE = { tmax: "#ef4444", tmin: "#3b82f6", tavg: "#f97316" };
const COLOR_A = { tmax: "#1D9E75", tmin: "#5DCAA5", prec: "#9FE1CB" };
const COLOR_B = { tmax: "#378ADD", tmin: "#93c5fd", prec: "#bfdbfe" };

// Recharts passes these props to custom bar shapes.
// `yAxis.scale` is available when recharts injects the axis into the shape context.
type TBarShape = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  fill?: string;
  fillOpacity?: number;
  yAxis?: { scale?: (v: number) => number };
};

// Props recharts passes to custom dot renderers on Line.
// All fields are typed as T | undefined because DotItemDotProps uses string | undefined
// for some fields, and exactOptionalPropertyTypes requires explicit undefined unions.
type TDotRendererProps = {
  cx?: number | undefined;
  cy?: number | undefined;
  r?: number | string | undefined;
  fill?: string | undefined;
  stroke?: string | undefined;
  index?: number | undefined;
};

// Always draws the bar from y=0 to y=value, regardless of axis minimum.
// Primary path: uses yAxis.scale(0) for the baseline.
// Fallback: uses recharts-computed y/height (correct when domain=[0, max]).
function PrecipBarShape(props: TBarShape) {
  const { x = 0, width = 0, fill = HUMID_COLOR, fillOpacity = 1 } = props;
  const zeroY = props.yAxis?.scale?.(0);
  const valueY = props.yAxis?.scale?.(props.value ?? 0);
  if (zeroY !== undefined && valueY !== undefined) {
    return (
      <rect
        x={x}
        y={valueY}
        width={width}
        height={Math.max(0, zeroY - valueY)}
        fill={fill}
        fillOpacity={fillOpacity}
        rx={2}
      />
    );
  }
  return (
    <rect
      x={x}
      y={props.y ?? 0}
      width={width}
      height={Math.max(0, props.height ?? 0)}
      fill={fill}
      fillOpacity={fillOpacity}
      rx={2}
    />
  );
}

const DEFAULT_VISIBLE: TVisibleSeries = { tmax: true, tmin: true, tavg: false, prec: true };

type TComparePoint = {
  monthName: string;
  tmaxA: number;
  tminA: number;
  tavgA: number;
  precA: number;
  tmaxB: number;
  tminB: number;
  tavgB: number;
  precB: number;
};

type TChartSummary = { annualAvgTemp: string; totalPrec: number; aridCount: number };

type TSummaryStatsProps = { summary: TChartSummary };

function buildCompareData(
  dataA: TMonthlyTemperature[],
  dataB: TMonthlyTemperature[],
): TComparePoint[] {
  return dataA.map((a, i) => {
    const b = dataB[i] ?? { tmax: 0, tmin: 0, prec: 0 };
    return {
      monthName: a.monthName,
      tmaxA: a.tmax,
      tminA: a.tmin,
      tavgA: (a.tmax + a.tmin) / 2,
      precA: a.prec,
      tmaxB: b.tmax,
      tminB: b.tmin,
      tavgB: (b.tmax + b.tmin) / 2,
      precB: b.prec,
    };
  });
}

function computeChartSummary(data: TMonthlyTemperature[], aridity: TMonthAridity[]): TChartSummary {
  const avgTemp = aridity.reduce((s, m) => s + m.tavg, 0) / aridity.length;
  return {
    annualAvgTemp: avgTemp.toFixed(1),
    totalPrec: Math.round(data.reduce((s, d) => s + d.prec, 0)),
    aridCount: aridity.filter((m) => m.isArid).length,
  };
}

function SummaryStats({ summary }: TSummaryStatsProps) {
  const { t } = useTranslation();
  return (
    <p className="mb-3 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
      {t("chart.meanTemp")}: {summary.annualAvgTemp}°C
      {" | "}
      {t("chart.annualPrec")}: {summary.totalPrec} mm
      {" | "}
      {t("chart.aridMonths")}: {summary.aridCount}
    </p>
  );
}

function AridityLegend() {
  const { t } = useTranslation();
  return (
    <div className="mt-2 flex justify-center gap-6 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: ARID_COLOR }} />
        {t("chart.aridPeriod")}
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-3 w-3 rounded-sm"
          style={{ backgroundColor: HUMID_COLOR }}
        />
        {t("chart.humidPeriod")}
      </span>
    </div>
  );
}

type TModeButtonProps = {
  isActive: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
};

function ModeButton({ isActive, onClick, title, children }: TModeButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors"
      style={{
        backgroundColor: isActive ? "var(--color-primary)" : "transparent",
        borderColor: isActive ? "var(--color-primary)" : "var(--color-border)",
        color: isActive ? "#ffffff" : "var(--color-text-secondary)",
      }}
    >
      {children}
    </button>
  );
}

// Bar chart icon (standard mode)
function IconBarChart() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="5" width="3" height="8" rx="0.5" fill="currentColor" />
      <rect x="5.5" y="2" width="3" height="11" rx="0.5" fill="currentColor" />
      <rect x="10" y="7" width="3" height="6" rx="0.5" fill="currentColor" />
    </svg>
  );
}

// Area chart icon (Walter-Lieth mode)
function IconAreaChart() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 11 L4 6 L7 8 L10 3 L13 5 L13 13 L1 13 Z" fill="currentColor" opacity="0.4" />
      <path
        d="M1 11 L4 6 L7 8 L10 3 L13 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// Catmull-rom to cubic bezier: produces smooth curves matching recharts "monotone" style
function catmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

type TWLScaledPoint = { monthName: string; tavg: number; prec: number; precScaled: number };

type TWLCustomizedProps = { wlData: TWLScaledPoint[]; wlScales: TWalterLiethScales | null };

type TWLTooltipProps = { active?: boolean; label?: string; wlData?: TWLScaledPoint[] };

// Renders the Walter-Lieth fills and lines via SVG clipPath technique.
// Uses recharts v3 hooks to access the axis coordinate systems.
function WLCustomized({ wlData, wlScales }: TWLCustomizedProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale("left");

  if (!xScale || !yScale || wlData.length === 0) return null;

  const isPoint = (p: {
    x: number | undefined;
    y: number | undefined;
  }): p is { x: number; y: number } => p.x !== undefined && p.y !== undefined;

  const tempRaw = wlData.map((d) => ({
    x: xScale(d.monthName, { position: "middle" }),
    y: yScale(d.tavg),
  }));
  const precRaw = wlData.map((d) => ({
    x: xScale(d.monthName, { position: "middle" }),
    y: yScale(d.precScaled),
  }));
  const baselineRaw = yScale(wlScales?.tempMin ?? 0);

  const tempPts = tempRaw.filter(isPoint);
  const precPts = precRaw.filter(isPoint);

  if (
    tempPts.length !== wlData.length ||
    precPts.length !== wlData.length ||
    baselineRaw === undefined
  )
    return null;

  const baselineY = baselineRaw;
  const firstX = tempPts[0].x;
  const lastX = tempPts[tempPts.length - 1].x;

  const tempLine = catmullRomPath(tempPts);
  const precLine = catmullRomPath(precPts);

  const f = (n: number) => n.toFixed(2);
  const tempArea = `${tempLine} L ${f(lastX)},${f(baselineY)} L ${f(firstX)},${f(baselineY)} Z`;
  const precArea = `${precLine} L ${f(lastX)},${f(baselineY)} L ${f(firstX)},${f(baselineY)} Z`;

  // Combined even-odd path: XOR of the two shapes.
  // Winding count 1 (inside exactly one area) → visible; 2 (inside both) → clipped out.
  // Result: only the gap between the two curves is visible through the clipPath.
  const diffPath = `${precArea} ${tempArea}`;

  return (
    <g>
      <defs>
        <clipPath id="wl-clip-diff" clipPathUnits="userSpaceOnUse">
          <path d={diffPath} clipRule="evenodd" />
        </clipPath>
      </defs>
      {/* Humid zone (blue): prec area — visible only above the temperature curve */}
      <path
        d={precArea}
        fill="#BFDBFE"
        fillOpacity={0.85}
        clipPath="url(#wl-clip-diff)"
        stroke="none"
      />
      {/* Arid zone (yellow): temp area — visible only above the precipitation curve */}
      <path
        d={tempArea}
        fill="#FDE68A"
        fillOpacity={0.9}
        clipPath="url(#wl-clip-diff)"
        stroke="none"
      />
      <path d={precLine} fill="none" stroke="#3B82F6" strokeWidth={1.5} />
      <path d={tempLine} fill="none" stroke="#F97316" strokeWidth={2} />
      {tempPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#F97316" stroke="white" strokeWidth={1} />
      ))}
    </g>
  );
}

function WLTooltip({ active, label, wlData }: TWLTooltipProps) {
  const { t } = useTranslation();
  if (!active || !label) return null;
  const point = wlData?.find((d) => d.monthName === label);
  if (!point) return null;
  const isArid = point.tavg * 2 > point.prec;
  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-2"
      style={{ fontSize: 13 }}
    >
      <p className="mb-1 font-semibold text-[var(--color-text)]">{label}</p>
      <p style={{ color: "#F97316" }}>
        {t("chart.avgTemperature")}: {point.tavg.toFixed(1)}°C
      </p>
      <p style={{ color: "#3B82F6" }}>
        {t("chart.precipitation")}: {Math.round(point.prec)} mm
      </p>
      <p className="mt-1" style={{ color: isArid ? "#D97706" : "#2563EB" }}>
        {isArid ? t("chart.aridPeriod") : t("chart.humidPeriod")}
      </p>
    </div>
  );
}

type TWalterLiethChartProps = {
  chartData: Record<string, unknown>[];
  scales: TWalterLiethScales | null;
  summary: TChartSummary | null;
};

function WalterLiethChart({ chartData, scales, summary }: TWalterLiethChartProps) {
  const { t } = useTranslation();

  const scaledData: TWLScaledPoint[] = chartData.map((d) => {
    const rawName = d["monthName"];
    return {
      monthName: typeof rawName === "string" ? rawName : "",
      tavg: Number(d["tavg"] ?? 0),
      prec: Number(d["prec"] ?? 0),
      precScaled: Number(d["prec"] ?? 0) / 2,
    };
  });

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
              {/* Right axis — mm reference only, no series bound to it */}
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
              {/* Invisible lines — only for Legend entries */}
              <Line
                yAxisId="left"
                dataKey="precScaled"
                name={t("chart.precipitation")}
                stroke="#3B82F6"
                strokeWidth={0}
                dot={false}
                legendType="square"
              />
              <Line
                yAxisId="left"
                dataKey="tavg"
                name={t("chart.avgTemperature")}
                stroke="#F97316"
                strokeWidth={0}
                dot={false}
                legendType="line"
              />
              {/* Custom SVG clipPath renderer — hooks access the chart's axis scales */}
              <Customized component={WLCustomized} wlData={scaledData} wlScales={scales} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <AridityLegend />
    </>
  );
}

export function TempPrecipChart({
  data,
  cityName,
  selectedMonth,
  dataA,
  dataB,
  labelA,
  labelB,
}: TTempPrecipChartProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState<TVisibleSeries>(DEFAULT_VISIBLE);
  const [chartMode, setChartMode] = useState<TChartMode>("standard");

  const isCompare = dataA !== undefined;
  const isWalterLieth = chartMode === "walter-lieth";
  const activeCount = Object.values(visible).filter(Boolean).length;

  function handleToggle(key: keyof TVisibleSeries) {
    if (visible[key] && activeCount === 1) return;
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const hasData = isCompare
    ? (dataA?.length ?? 0) > 0 || (dataB?.length ?? 0) > 0
    : (data?.length ?? 0) > 0;

  if (!hasData) return null;

  const aridity = !isCompare && data?.length ? computeAridityPeriods(data) : null;
  const aridityA = isCompare && dataA?.length ? computeAridityPeriods(dataA) : null;

  const scalesData = isCompare ? [...(dataA ?? []), ...(dataB ?? [])] : (data ?? []);
  const scales = scalesData.length > 0 ? getWalterLiethScales(scalesData) : null;

  // Right (prec) axis domain must start at 0 — precipitation is never negative.
  // scales.precMin = tempMin * 2 which can be negative, so we never use it for bars.
  const allPrecValues = isCompare
    ? [...(dataA ?? []).map((d) => d.prec), ...(dataB ?? []).map((d) => d.prec)]
    : (data ?? []).map((d) => d.prec);
  const rawPrecMax = allPrecValues.length > 0 ? Math.max(...allPrecValues) : 0;
  const rightMax = Math.ceil(rawPrecMax / 10) * 10 || 100;

  const summary = aridity && data ? computeChartSummary(data, aridity) : null;

  const selectedMonthName =
    !isCompare && selectedMonth !== undefined
      ? (data?.find((d) => d.month === selectedMonth)?.monthName ?? "")
      : "";

  const chartData: Record<string, unknown>[] = isCompare
    ? buildCompareData(dataA ?? [], dataB ?? [])
    : (data ?? []).map((d) => ({ ...d, tavg: (d.tmax + d.tmin) / 2 }));

  const chips: { key: keyof TVisibleSeries; label: string }[] = [
    { key: "tmax", label: t("sidebar.variables.tmax") },
    { key: "tmin", label: t("sidebar.variables.tmin") },
    { key: "tavg", label: t("sidebar.variables.tavg") },
    { key: "prec", label: t("sidebar.variables.prec") },
  ];

  // In Walter-Lieth mode only tavg/prec are relevant
  const isChipDimmed = (key: keyof TVisibleSeries) =>
    isWalterLieth && (key === "tmax" || key === "tmin");

  return (
    <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Mode toggle buttons — top-left */}
        <div className="flex gap-1.5">
          <ModeButton
            isActive={chartMode === "standard"}
            onClick={() => setChartMode("standard")}
            title={t("chart.modeStandard")}
          >
            <IconBarChart />
          </ModeButton>
          <ModeButton
            isActive={chartMode === "walter-lieth"}
            onClick={() => setChartMode("walter-lieth")}
            title={t("chart.modeWalterLieth")}
          >
            <IconAreaChart />
          </ModeButton>
        </div>

        {cityName && (
          <h3 className="font-semibold text-[length:var(--font-md)] md:text-[length:var(--font-lg)] text-[var(--color-text)]">
            {t("chart.title")}: {cityName}
          </h3>
        )}
        {!isWalterLieth && selectedMonthName && (
          <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
            {t("chart.selectedMonth", { month: selectedMonthName })}
          </span>
        )}
        <div className={`flex flex-wrap gap-2 ${cityName ? "ml-auto" : "ml-auto"}`}>
          {chips.map(({ key, label }) => {
            const isLastActive = visible[key] && activeCount === 1;
            const isDimmed = isChipDimmed(key);
            return (
              <div
                key={key}
                className={isLastActive || isDimmed ? "pointer-events-none opacity-40" : ""}
              >
                <FilterChip
                  label={label}
                  isActive={visible[key] && !isDimmed}
                  onClick={() => handleToggle(key)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {isWalterLieth && !isCompare ? (
        <WalterLiethChart chartData={chartData} scales={scales} summary={summary} />
      ) : (
        <>
          {summary && <SummaryStats summary={summary} />}
          <div className="overflow-x-auto">
            <div className="h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px] min-w-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 60, bottom: 50, left: 20 }}
                  barGap={2}
                  barCategoryGap="30%"
                >
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
                    yAxisId="temp"
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
                  <YAxis
                    yAxisId="prec"
                    orientation="right"
                    domain={[0, rightMax]}
                    allowDataOverflow={false}
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      fontSize: 13,
                    }}
                    formatter={(value, name) => {
                      const v = Array.isArray(value) ? value.join(", ") : String(value ?? "");
                      const isPrecip = String(name).includes(t("chart.precipitation"));
                      return [isPrecip ? `${v} mm` : `${v} °C`, name];
                    }}
                  />
                  <Legend verticalAlign="bottom" height={48} wrapperStyle={{ paddingTop: 24 }} />

                  {!isCompare && visible.prec && (
                    <Bar
                      yAxisId="prec"
                      dataKey="prec"
                      name={t("chart.precipitation")}
                      fill={HUMID_COLOR}
                      minPointSize={0}
                      background={false}
                      shape={<PrecipBarShape />}
                    >
                      {aridity?.map((m, i) => {
                        const isSelected = selectedMonth === undefined || m.month === selectedMonth;
                        return (
                          <Cell
                            key={`prec-${i}`}
                            fill={m.isArid ? ARID_COLOR : HUMID_COLOR}
                            fillOpacity={isSelected ? 0.8 : 0.2}
                          />
                        );
                      })}
                    </Bar>
                  )}
                  {!isCompare && visible.tmax && (
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="tmax"
                      name={t("chart.maxTemperature")}
                      stroke={COLOR_SINGLE.tmax}
                      strokeWidth={2}
                      dot={(dotProps: TDotRendererProps) => {
                        const { cx = 0, cy = 0, fill = COLOR_SINGLE.tmax, index = -1 } = dotProps;
                        const isSelected =
                          selectedMonth === undefined || aridity?.[index]?.month === selectedMonth;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isSelected && selectedMonth !== undefined ? 5 : 3}
                            fill={fill}
                            opacity={isSelected ? 1 : 0.2}
                            stroke="none"
                          />
                        );
                      }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {!isCompare && visible.tavg && (
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="tavg"
                      name={t("chart.avgTemperature")}
                      stroke={COLOR_SINGLE.tavg}
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      dot={(dotProps: TDotRendererProps) => {
                        const { cx = 0, cy = 0, fill = COLOR_SINGLE.tavg, index = -1 } = dotProps;
                        const isSelected =
                          selectedMonth === undefined || aridity?.[index]?.month === selectedMonth;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isSelected && selectedMonth !== undefined ? 5 : 3}
                            fill={fill}
                            opacity={isSelected ? 1 : 0.2}
                            stroke="none"
                          />
                        );
                      }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {!isCompare && visible.tmin && (
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="tmin"
                      name={t("chart.minTemperature")}
                      stroke={COLOR_SINGLE.tmin}
                      strokeWidth={2}
                      dot={(dotProps: TDotRendererProps) => {
                        const { cx = 0, cy = 0, fill = COLOR_SINGLE.tmin, index = -1 } = dotProps;
                        const isSelected =
                          selectedMonth === undefined || aridity?.[index]?.month === selectedMonth;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isSelected && selectedMonth !== undefined ? 5 : 3}
                            fill={fill}
                            opacity={isSelected ? 1 : 0.2}
                            stroke="none"
                          />
                        );
                      }}
                      activeDot={{ r: 5 }}
                    />
                  )}

                  {isCompare && visible.prec && (
                    <Bar
                      yAxisId="prec"
                      dataKey="precA"
                      name={`${labelA ?? ""} — ${t("chart.precipitation")}`}
                      fill={HUMID_COLOR}
                      opacity={0.8}
                      minPointSize={0}
                      background={false}
                      shape={<PrecipBarShape />}
                    >
                      {aridityA?.map((m, i) => (
                        <Cell key={`precA-${i}`} fill={m.isArid ? ARID_COLOR : HUMID_COLOR} />
                      ))}
                    </Bar>
                  )}
                  {isCompare && visible.tmax && (
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="tmaxA"
                      name={`${labelA ?? ""} — ${t("chart.maxTemperature")}`}
                      stroke={COLOR_A.tmax}
                      strokeWidth={2}
                      dot={{ r: 2.5 }}
                      activeDot={{ r: 4 }}
                    />
                  )}
                  {isCompare && visible.tavg && (
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="tavgA"
                      name={`${labelA ?? ""} — ${t("chart.avgTemperature")}`}
                      stroke="#0F6E56"
                      strokeWidth={2}
                      dot={{ r: 2.5 }}
                      activeDot={{ r: 4 }}
                      strokeDasharray="5 3"
                    />
                  )}
                  {isCompare && visible.tmin && (
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="tminA"
                      name={`${labelA ?? ""} — ${t("chart.minTemperature")}`}
                      stroke={COLOR_A.tmin}
                      strokeWidth={2}
                      dot={{ r: 2.5 }}
                      activeDot={{ r: 4 }}
                      strokeDasharray="4 2"
                    />
                  )}

                  {isCompare && visible.prec && (
                    <Bar
                      yAxisId="prec"
                      dataKey="precB"
                      name={`${labelB ?? ""} — ${t("chart.precipitation")}`}
                      fill={COLOR_B.prec}
                      opacity={0.8}
                      minPointSize={0}
                      background={false}
                      shape={<PrecipBarShape />}
                    />
                  )}
                  {isCompare && visible.tmax && (
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="tmaxB"
                      name={`${labelB ?? ""} — ${t("chart.maxTemperature")}`}
                      stroke={COLOR_B.tmax}
                      strokeWidth={2}
                      dot={{ r: 2.5 }}
                      activeDot={{ r: 4 }}
                    />
                  )}
                  {isCompare && visible.tavg && (
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="tavgB"
                      name={`${labelB ?? ""} — ${t("chart.avgTemperature")}`}
                      stroke="#1e3a8a"
                      strokeWidth={2}
                      dot={{ r: 2.5 }}
                      activeDot={{ r: 4 }}
                      strokeDasharray="5 3"
                    />
                  )}
                  {isCompare && visible.tmin && (
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="tminB"
                      name={`${labelB ?? ""} — ${t("chart.minTemperature")}`}
                      stroke={COLOR_B.tmin}
                      strokeWidth={2}
                      dot={{ r: 2.5 }}
                      activeDot={{ r: 4 }}
                      strokeDasharray="4 2"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          {visible.prec && <AridityLegend />}
        </>
      )}
    </div>
  );
}
