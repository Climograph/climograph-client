import type { TBarShape } from "../TempPrecipChart.type";
import { CHART_COLORS } from "../utils/chartColors";

/**
 * Draws the bar from y=0 to y=value regardless of axis minimum.
 * Primary: uses yAxis.scale(0) for explicit zero baseline.
 * Fallback: uses recharts-computed y/height (correct when domain=[0, max]).
 */
export function PrecipBarShape(props: TBarShape) {
  const { x = 0, width = 0, fill = CHART_COLORS.humid, fillOpacity = 1 } = props;

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
