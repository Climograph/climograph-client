import type { TWalterLiethColors } from "../TempPrecipChart.type";

export const WL_COLORS_A: TWalterLiethColors = {
  humidFill: "#BFDBFE",
  aridFill: "#FDE68A",
  humidFillOpacity: 0.85,
  aridFillOpacity: 0.9,
  tempLineColor: "#F97316",
  precLineColor: "#3B82F6",
};

export const WL_COLORS_B: TWalterLiethColors = {
  humidFill: "#BFDBFE",
  aridFill: "#FDE68A",
  humidFillOpacity: 0.6,
  aridFillOpacity: 0.65,
  tempLineColor: "#6366F1",
  precLineColor: "#2563EB",
};

export const CHART_COLORS = {
  arid: "var(--chart-arid)",
  humid: "var(--chart-humid)",
  single: {
    tmax: "var(--chart-temp-max)",
    tmin: "var(--chart-temp-min)",
    tavg: "var(--chart-temp-avg)",
  },
  compareA: {
    tmax: "var(--chart-compare-a-max)",
    tmin: "var(--chart-compare-a-min)",
    prec: "var(--chart-compare-a-prec)",
    tavg: "#0F6E56",
  },
  compareB: {
    tmax: "var(--chart-compare-b-max)",
    tmin: "var(--chart-compare-b-min)",
    prec: "var(--chart-compare-b-prec)",
    tavg: "#1e3a8a",
  },
  wl: {
    tempStroke: "#F97316",
    precStroke: "#3B82F6",
    humidFill: "#BFDBFE",
    aridFill: "#FDE68A",
    aridTooltip: "#D97706",
    humidTooltip: "#2563EB",
  },
};
