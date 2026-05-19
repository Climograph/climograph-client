export const MONTHS = {
  JANUARY: "Jan",
  FEBRUARY: "Feb",
  MARCH: "Mar",
  APRIL: "Apr",
  MAY: "May",
  JUNE: "Jun",
  JULY: "Jul",
  AUGUST: "Aug",
  SEPTEMBER: "Sep",
  OCTOBER: "Oct",
  NOVEMBER: "Nov",
  DECEMBER: "Dec",
} as const;

export const MONTHS_ARRAY = Object.values(MONTHS);

export const DEFAULT_MAP_CENTER = { lat: 40.4168, lng: -3.7038 };

export const CLIMATE_RANGE = {
  MIN_START: 1951,
  MAX_START: 1994,
  WINDOW: 30,
} as const;

export const CLIMATE_START = 1970;
