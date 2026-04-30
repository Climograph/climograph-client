import { CLIMATE_START } from "@/constants/climate.constant";
import { DATASETS, DEFAULT_VARIABLES } from "@/constants/sidebar.constant";
import { CELL_SIZES } from "@/constants/worldclim.constant";
import type { TCellSize, TDataset, TMonthFilter, TVariable } from "@/types/domain/climate";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TFiltersData = {
  dataset: TDataset;
  periodStart: number;
  variables: TVariable[];
  gridSize: TCellSize;
  months: TMonthFilter;
};

type TFiltersState = TFiltersData & {
  actions: {
    setDataset: (d: TDataset) => void;
    setPeriodStart: (n: number) => void;
    toggleVariable: (v: TVariable) => void;
    setGridSize: (g: TCellSize) => void;
    toggleMonth: (n: number) => void;
    selectAllMonths: () => void;
  };
};

const DEFAULT_FILTERS: TFiltersData = {
  dataset: DATASETS.CLIMATE,
  periodStart: CLIMATE_START,
  variables: [...DEFAULT_VARIABLES] as TVariable[],
  gridSize: CELL_SIZES.TEN_MINUTES,
  months: "all",
};

export const useFiltersStore = create<TFiltersState>()(
  persist(
    (set) => ({
      ...DEFAULT_FILTERS,
      actions: {
        setDataset: (dataset) => set({ dataset }),
        setPeriodStart: (periodStart) => set({ periodStart }),
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
        periodStart: state.periodStart,
        variables: state.variables,
        gridSize: state.gridSize,
        months: state.months,
      }),
    },
  ),
);
