import { Layout } from "@/components/Layout";
import { ROUTES } from "@/constants";
import {
  ClimateComparison,
  ClimateStatistics,
  CompareCities,
  ComparePeriods,
  HeatMap,
} from "@/pages";
import { createElement } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: createElement(Layout),
    children: [
      {
        index: true,
        element: createElement(Navigate, {
          to: ROUTES.CLIMATE_STATISTICS_SEARCH,
          replace: true,
        }),
      },
      {
        path: ROUTES.CLIMATE_STATISTICS,
        element: createElement(Navigate, {
          to: ROUTES.CLIMATE_STATISTICS_SEARCH,
          replace: true,
        }),
      },
      {
        path: ROUTES.CLIMATE_STATISTICS_SEARCH,
        element: createElement(ClimateStatistics),
      },
      {
        path: ROUTES.COMPARE_CITIES,
        element: createElement(CompareCities),
      },
      {
        path: ROUTES.COMPARE_PERIODS,
        element: createElement(ComparePeriods),
      },
      {
        path: ROUTES.COMPARE_LEGACY,
        element: createElement(ClimateComparison),
      },
      {
        path: ROUTES.HEAT_MAP,
        element: createElement(HeatMap),
      },
      {
        path: "*",
        element: createElement(Navigate, {
          to: ROUTES.CLIMATE_STATISTICS_SEARCH,
          replace: true,
        }),
      },
    ],
  },
]);
