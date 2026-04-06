import { Layout } from "@/components/Layout";
import { ROUTES } from "@/constants";
import { HomePage } from "@/pages";
import { createElement } from "react";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: createElement(Layout),
    children: [
      {
        index: true,
        element: createElement(HomePage),
      },
    ],
  },
]);
