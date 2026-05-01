export const DATASETS = {
  CLIMATE: "climate",
  WEATHER: "weather",
} as const;

export const DEFAULT_VARIABLES = ["tmax", "tmin", "prec"] as const;

export const SIDEBAR_PARAMS = {
  DATASET: "dataset",
  YEAR_START: "yearStart",
  YEAR_END: "yearEnd",
  VARIABLES: "variables",
  GRID: "grid",
  MONTHS: "months",
  BBOX_NORTH: "north",
  BBOX_SOUTH: "south",
  BBOX_WEST: "west",
  BBOX_EAST: "east",
} as const;
