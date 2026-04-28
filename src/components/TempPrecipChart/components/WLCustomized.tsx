import { useXAxisScale, useYAxisScale } from "recharts";
import type { TWLCustomizedProps } from "../TempPrecipChart.type";
import { catmullRomPath } from "../utils/catmullRomPath";
import { CHART_COLORS } from "../utils/chartColors";

/**
 * Renders Walter-Lieth fills and curves via SVG clipPath (even-odd winding rule).
 * Uses recharts v3 hooks to access the chart's coordinate systems.
 */
export function WLCustomized({ wlData, wlScales }: TWLCustomizedProps) {
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

  // * XOR of the two areas: only the gap between the curves is visible.
  const diffPath = `${precArea} ${tempArea}`;

  return (
    <g>
      <defs>
        <clipPath id="wl-clip-diff" clipPathUnits="userSpaceOnUse">
          <path d={diffPath} clipRule="evenodd" />
        </clipPath>
      </defs>
      <path
        d={precArea}
        fill={CHART_COLORS.wl.humidFill}
        fillOpacity={0.85}
        clipPath="url(#wl-clip-diff)"
        stroke="none"
      />
      <path
        d={tempArea}
        fill={CHART_COLORS.wl.aridFill}
        fillOpacity={0.9}
        clipPath="url(#wl-clip-diff)"
        stroke="none"
      />
      <path d={precLine} fill="none" stroke={CHART_COLORS.wl.precStroke} strokeWidth={1.5} />
      <path d={tempLine} fill="none" stroke={CHART_COLORS.wl.tempStroke} strokeWidth={2} />
      {tempPts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill={CHART_COLORS.wl.tempStroke}
          stroke="white"
          strokeWidth={1}
        />
      ))}
    </g>
  );
}
