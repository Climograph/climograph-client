import type { TCompareStats } from "@/pages/ClimateComparison/ClimateComparison.util";

export type TCompareStatsGridProps = {
  labelA: string;
  labelB: string;
  statsA: TCompareStats;
  statsB: TCompareStats;
  activeColumn?: number | undefined;
};
