export const DATASETS = {
  CLIMATE: "climate",
  WEATHER: "weather",
} as const;

export const SIDEBAR_VARIABLES = ["tmax", "tmin", "prec", "tavg", "wind", "vapr"] as const;

export const DEFAULT_VARIABLES: readonly string[] = ["tmax", "tmin", "prec"];

export const WEATHER_YEAR_RANGE = {
  MIN: 1951,
  MAX: 2024,
} as const;

export const SIDEBAR_PARAMS = {
  DATASET: "dataset",
  YEAR_START: "yearStart",
  YEAR_END: "yearEnd",
  VARIABLES: "variables",
  GRID: "grid",
  MONTH: "month",
  BBOX_NORTH: "north",
  BBOX_SOUTH: "south",
  BBOX_WEST: "west",
  BBOX_EAST: "east",
} as const;
