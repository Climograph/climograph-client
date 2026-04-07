import { ROUTES } from "./route.constant";

export const NAV_LINKS = [
  { to: ROUTES.CLIMATE_STATISTICS_SEARCH, labelKey: "navbar.links.climateStatistics" },
  { to: ROUTES.CLIMATE_COMPARISON, labelKey: "navbar.links.climateComparison" },
  { to: ROUTES.HEAT_MAP, labelKey: "navbar.links.heatMap" },
] as const;
