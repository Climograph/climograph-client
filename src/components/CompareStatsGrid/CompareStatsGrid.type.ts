import type { TCompareStats } from "@/pages/ClimateComparison/ClimateComparison.type";

export type TCompareStatsGridProps = {
  labelA: string;
  labelB: string;
  statsA: TCompareStats;
  statsB: TCompareStats;
  altitudeA?: number | null;
  altitudeB?: number | null;
  activeColumn?: number | undefined;
};
