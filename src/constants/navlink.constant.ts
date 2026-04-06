import { ROUTES } from "./route.constant";

export const NAV_LINKS = [
  { to: ROUTES.CLIMATE_STATISTICS_SEARCH, label: "Climate Statistics" },
  { to: ROUTES.CLIMATE_COMPARISON, label: "Climate Comparison" },
  { to: ROUTES.HEAT_MAP, label: "Heat Map" },
] as const;
