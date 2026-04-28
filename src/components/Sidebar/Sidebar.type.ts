import { DATASETS } from "@/constants";
import type { TCellSize, TDataset, TMonthFilter, TVariable } from "@/types";
import type { TCellSizeOption } from "@/types/ui/cell-size";

export type TSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type TSidebarFilters = {
  dataset: TDataset;
  yearStart: number;
  yearEnd: number;
  variables: TVariable[];
  grid: TCellSize;
  month: TMonthFilter;
  cellSizeOptions: readonly TCellSizeOption[];
};

export type TSidebarHandlers = {
  onDatasetChange: (dataset: TDataset) => void;
  onYearStartChange: (year: number) => void;
  onYearEndChange: (year: number) => void;
  onVariableToggle: (variable: TVariable) => void;
  onGridChange: (grid: TCellSize) => void;
  onMonthChange: (month: TMonthFilter) => void;
  onApply: () => void;
};

export type TSidebarFiltersState = {
  dataset: (typeof DATASETS)[keyof typeof DATASETS];
  setDataset: (dataset: (typeof DATASETS)[keyof typeof DATASETS]) => void;
  periodWindowStart: string;
  setPeriodWindowStart: (value: string) => void;
  variables: TVariable[];
  toggleVariable: (variable: TVariable) => void;
  grid: number;
  setGrid: (size: number) => void;
  month: TMonthFilter;
  setMonth: (month: TMonthFilter) => void;
  cellSizeOptions: { value: number; label: string }[];
  handleApply: () => void;
};
