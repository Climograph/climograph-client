export type TCompareStats = {
  avgTmax: number;
  avgTmin: number;
  totalPrec: number;
  aridMonths: number;
  martonneIndex: number | null;
};

export type TCompareChartPoint = {
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

export type TDiffStats = {
  warmerCity: "A" | "B" | "tie";
  tmaxDiff: number;
  moreRainCity: "A" | "B" | "tie";
  precDiff: number;
  hottestMonthName: string;
  hottestTempA: number;
  hottestTempB: number;
  coldestMonthName: string;
  coldestTempA: number;
  coldestTempB: number;
};
