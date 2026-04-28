import {
  CELL_SIZES,
  CELL_SIZE_OPTIONS,
  CLIMATE_RANGE,
  DATASETS,
  DEFAULT_VARIABLES,
  SIDEBAR_PARAMS,
  SIDEBAR_VARIABLES,
} from "@/constants";
import type { TCellSize, TDataset, TMonthFilter, TVariable } from "@/types";
import type { TCellSizeOption } from "@/types/ui/cell-size";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

function parseVariables(raw: string | null): TVariable[] {
  if (!raw) return DEFAULT_VARIABLES as TVariable[];
  return raw
    .split(",")
    .filter((v): v is TVariable => (SIDEBAR_VARIABLES as readonly string[]).includes(v));
}

export function buildPeriodWindowOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let start = CLIMATE_RANGE.MIN_START; start <= CLIMATE_RANGE.MAX_START; start += 10) {
    options.push({ value: String(start), label: `${start}–${start + CLIMATE_RANGE.WINDOW}` });
  }
  return options;
}

export const PERIOD_WINDOW_OPTIONS = buildPeriodWindowOptions();

export function useSidebarFilters() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [dataset, setDataset] = useState<TDataset>(
    (searchParams.get(SIDEBAR_PARAMS.DATASET) as TDataset | null) ?? DATASETS.CLIMATE,
  );
  const [periodWindowStart, setPeriodWindowStart] = useState<string>(
    searchParams.get(SIDEBAR_PARAMS.YEAR_START) ?? String(CLIMATE_RANGE.MIN_START),
  );
  const [variables, setVariables] = useState<TVariable[]>(
    parseVariables(searchParams.get(SIDEBAR_PARAMS.VARIABLES)),
  );
  const [grid, setGrid] = useState<TCellSize>(
    (searchParams.get(SIDEBAR_PARAMS.GRID) as TCellSize | null) ?? CELL_SIZES.TEN_MINUTES,
  );
  const [month, setMonth] = useState<TMonthFilter>(
    (searchParams.get(SIDEBAR_PARAMS.MONTH) as TMonthFilter | null) ?? "all",
  );

  function toggleVariable(v: TVariable) {
    setVariables((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  function handleApply() {
    const next = new URLSearchParams(searchParams);
    next.set(SIDEBAR_PARAMS.DATASET, dataset);
    next.set(SIDEBAR_PARAMS.VARIABLES, variables.join(","));
    next.set(SIDEBAR_PARAMS.GRID, grid);
    next.set(SIDEBAR_PARAMS.MONTH, month);
    if (dataset === DATASETS.WEATHER) {
      next.set(SIDEBAR_PARAMS.YEAR_START, periodWindowStart);
      next.set(SIDEBAR_PARAMS.YEAR_END, String(Number(periodWindowStart) + CLIMATE_RANGE.WINDOW));
    } else {
      next.delete(SIDEBAR_PARAMS.YEAR_START);
      next.delete(SIDEBAR_PARAMS.YEAR_END);
    }
    setSearchParams(next);
  }

  const cellSizeOptions: readonly TCellSizeOption[] = Object.entries(CELL_SIZE_OPTIONS).map(
    ([value]) => ({ value: value as TCellSize, label: t(`cellSizes.${value}`) }),
  );

  return {
    dataset,
    setDataset,
    periodWindowStart,
    setPeriodWindowStart,
    variables,
    toggleVariable,
    grid,
    setGrid,
    month,
    setMonth,
    cellSizeOptions,
    handleApply,
  };
}
