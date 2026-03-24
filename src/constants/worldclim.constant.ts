export const CELL_SIZES = {
  TEN_MINUTES: "10m",
  FIVE_MINUTES: "5m",
  TWO_POINT_FIVE_MINUTES: "2.5m",
  THIRTY_SECONDS: "30s",
} as const;

export const CELL_SIZE_OPTIONS = {
  [CELL_SIZES.TEN_MINUTES]: "10 min (~324 km²)",
  [CELL_SIZES.FIVE_MINUTES]: "5 min (~81 km²)",
  [CELL_SIZES.TWO_POINT_FIVE_MINUTES]: "2.5 min (~20.25 km²)",
  [CELL_SIZES.THIRTY_SECONDS]: "30 sec (~1 km²)",
} as const;
