import type { TClimatePeriod } from "@/constants";
import {
  CELL_SIZES,
  CLIMATE_PERIODS,
  DATASETS,
  DEFAULT_VARIABLES,
  WEATHER_VARIABLES,
} from "@/constants";
import type { TCellSize, TDataset, TMonthFilter, TVariable } from "@/types/";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TFiltersData = {
  dataset: TDataset;
  climatePeriod: TClimatePeriod;
  weatherYear: number;
  variables: TVariable[];
  gridSize: TCellSize;
  months: TMonthFilter;
};

type TFiltersState = TFiltersData & {
  actions: {
    setDataset: (d: TDataset) => void;
    setClimatePeriod: (period: TClimatePeriod) => void;
    setWeatherYear: (year: number) => void;
    toggleVariable: (v: TVariable) => void;
    setGridSize: (g: TCellSize) => void;
    toggleMonth: (n: number) => void;
    selectAllMonths: () => void;
  };
};

const DEFAULT_FILTERS: TFiltersData = {
  dataset: DATASETS.CLIMATE,
  climatePeriod: CLIMATE_PERIODS.C1970_2000,
  weatherYear: 2024,
  variables: [...DEFAULT_VARIABLES],
  gridSize: CELL_SIZES.TEN_MINUTES,
  months: "all",
};

export const useFiltersStore = create<TFiltersState>()(
  persist(
    (set) => ({
      ...DEFAULT_FILTERS,
      actions: {
        setDataset: (dataset) =>
          set((state) => {
            if (dataset === DATASETS.WEATHER) {
              const allowed = new Set<string>(WEATHER_VARIABLES);
              const filtered = state.variables.filter((v) => allowed.has(v));
              return {
                dataset,
                variables: filtered.length > 0 ? filtered : [...DEFAULT_VARIABLES],
              };
            }
            return { dataset };
          }),
        setClimatePeriod: (climatePeriod) => set({ climatePeriod }),
        setWeatherYear: (weatherYear) => set({ weatherYear }),
        toggleVariable: (v) =>
          set((state) => ({
            variables: state.variables.includes(v)
              ? state.variables.filter((x) => x !== v)
              : [...state.variables, v],
          })),
        setGridSize: (gridSize) => set({ gridSize }),
        toggleMonth: (n) =>
          set((state) => {
            const { months } = state;
            if (!Array.isArray(months)) return { months: [n] };
            if (months.includes(n)) {
              const next = months.filter((m) => m !== n);
              return { months: next.length === 0 ? "all" : next };
            }
            const next = [...months, n];
            return { months: next.length === 12 ? "all" : next };
          }),
        selectAllMonths: () => set({ months: "all" }),
      },
    }),
    {
      name: "climatica-filters",
      partialize: (state) => ({
        dataset: state.dataset,
        climatePeriod: state.climatePeriod,
        weatherYear: state.weatherYear,
        variables: state.variables,
        gridSize: state.gridSize,
        months: state.months,
      }),
    },
  ),
);
