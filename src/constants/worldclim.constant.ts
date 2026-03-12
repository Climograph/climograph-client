export const CELL_SIZES = {
  TEN_MINUTES: "10m",
  FIVE_MINUTES: "5m",
  TWO_POINT_FIVE_MINUTES: "2.5m",
  THIRTY_SECONDS: "30s",
} as const;

export const CELL_SIZE_OPTIONS = {
  [CELL_SIZES.TEN_MINUTES]: "10 min (~18 km)",
  [CELL_SIZES.FIVE_MINUTES]: "5 min (~9 km)",
  [CELL_SIZES.TWO_POINT_FIVE_MINUTES]: "2.5 min (~4.5 km)",
  [CELL_SIZES.THIRTY_SECONDS]: "30 sec (~1 km)",
} as const;
