import { CellSizeSelector, FilterChip, PeriodSelectRow, SectionLabel } from "@/components";
import { Dropdown } from "@/components/UI";
import {
  CELL_SIZE_OPTIONS,
  CLIMATE_PERIOD_LABELS,
  CLIMATE_PERIODS,
  CLIMATE_VARIABLES,
  DATASETS,
  ROUTES,
  SIDEBAR_PARAMS,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
  WEATHER_VARIABLES,
} from "@/constants";
import { useFiltersStore } from "@/stores";
import type { TCellSize, TCellSizeOption } from "@/types";
import { estimateCellCount, getCellCountStatus } from "@/utils";
import { sidebarFiltersSchema } from "@/validators";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";
import type { TDraftErrors, TDraftFilters, TSidebarProps } from "./Sidebar.type";

const CLIMATE_PERIOD_OPTIONS = Object.values(CLIMATE_PERIODS).map((period) => ({
  value: period,
  label: CLIMATE_PERIOD_LABELS[period],
}));

export function Sidebar({ isOpen, onClose }: TSidebarProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const {
    dataset,
    climatePeriod,
    weatherYear,
    variables,
    gridSize,
    months,
    actions: {
      setDataset,
      setClimatePeriod,
      setWeatherYear,
      toggleVariable,
      setGridSize,
      toggleMonth,
      selectAllMonths,
    },
  } = useFiltersStore();

  const [draft, setDraft] = useState<TDraftFilters>(() => ({
    dataset,
    climatePeriod,
    weatherYear,
    weatherYearInput: String(weatherYear),
    variables,
    gridSize,
    months,
  }));

  const [errors, setErrors] = useState<TDraftErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      setDraft({
        dataset,
        climatePeriod,
        weatherYear,
        weatherYearInput: String(weatherYear),
        variables: [...variables],
        gridSize,
        months,
      });
      setErrors({});
      setSubmitAttempted(false);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */

  const isHeatmapPage = pathname.startsWith(ROUTES.HEAT_MAP);

  const northRaw = searchParams.get(SIDEBAR_PARAMS.BBOX_NORTH);
  const southRaw = searchParams.get(SIDEBAR_PARAMS.BBOX_SOUTH);
  const westRaw = searchParams.get(SIDEBAR_PARAMS.BBOX_WEST);
  const eastRaw = searchParams.get(SIDEBAR_PARAMS.BBOX_EAST);
  const heatmapBbox =
    northRaw !== null && southRaw !== null && westRaw !== null && eastRaw !== null
      ? {
          north: Number(northRaw),
          south: Number(southRaw),
          west: Number(westRaw),
          east: Number(eastRaw),
        }
      : null;

  const cellCount =
    isHeatmapPage && heatmapBbox !== null ? estimateCellCount(heatmapBbox, draft.gridSize) : null;
  const cellStatus = cellCount !== null ? getCellCountStatus(cellCount) : null;
  const isTooMany = cellCount !== null && cellCount > 10_000;

  const cellSizeOptions: readonly TCellSizeOption[] = (
    Object.keys(CELL_SIZE_OPTIONS) as TCellSize[]
  ).map((value) => ({ value, label: t(`cellSizes.${value}`) }));

  function handleDraftDatasetChange(ds: (typeof DATASETS)[keyof typeof DATASETS]) {
    setDraft((prev) => ({
      ...prev,
      dataset: ds,
      variables:
        ds === DATASETS.WEATHER
          ? prev.variables.filter((v) => (WEATHER_VARIABLES as readonly string[]).includes(v))
          : prev.variables,
    }));
  }

  function handleDraftClimatePeriodChange(value: string) {
    const period = Object.values(CLIMATE_PERIODS).find((p) => p === value);
    if (period !== undefined) {
      setDraft((prev) => ({ ...prev, climatePeriod: period }));
    }
  }

  function handleDraftYearInputChange(val: string) {
    setDraft((prev) => ({ ...prev, weatherYearInput: val }));
    if (submitAttempted && errors["weatherYear"] !== undefined) {
      setErrors({});
    }
  }

  function handleDraftVariableToggle(v: string) {
    setDraft((prev) => ({
      ...prev,
      variables: prev.variables.includes(v as (typeof prev.variables)[number])
        ? prev.variables.filter((x) => x !== v)
        : ([...prev.variables, v] as typeof prev.variables),
    }));
  }

  function handleDraftGridSizeChange(size: TCellSize) {
    setDraft((prev) => ({ ...prev, gridSize: size }));
  }

  function handleDraftMonthToggle(month: number) {
    setDraft((prev) => {
      const current = prev.months === "all" ? [] : prev.months;
      const next = current.includes(month)
        ? current.filter((m) => m !== month)
        : [...current, month];
      return { ...prev, months: next.length === 0 ? "all" : next };
    });
  }

  function handleDraftSelectAllMonths() {
    setDraft((prev) => ({ ...prev, months: "all" }));
  }

  function handleApplyAndClose() {
    setSubmitAttempted(true);

    const parsedYear = parseInt(draft.weatherYearInput, 10);

    const result = sidebarFiltersSchema.safeParse({
      dataset: draft.dataset,
      climatePeriod: draft.climatePeriod,
      weatherYear: isNaN(parsedYear) ? draft.weatherYearInput : parsedYear,
    });

    if (!result.success) {
      const fieldErrors: TDraftErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0];
        if (typeof field === "string") {
          fieldErrors[field] = t(err.message, {
            min: WEATHER_MIN_YEAR,
            max: WEATHER_MAX_YEAR,
          });
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setDataset(draft.dataset);
    setClimatePeriod(draft.climatePeriod);
    setWeatherYear(result.data.weatherYear);
    draft.variables.forEach((v) => {
      if (!variables.includes(v)) toggleVariable(v);
    });
    variables.forEach((v) => {
      if (!draft.variables.includes(v)) toggleVariable(v);
    });
    setGridSize(draft.gridSize);
    if (draft.months === "all") {
      selectAllMonths();
    } else {
      draft.months.forEach((m) => toggleMonth(m));
    }

    void queryClient.invalidateQueries({ queryKey: ["climate"] });
    void queryClient.invalidateQueries({ queryKey: ["compare"] });
    void queryClient.invalidateQueries({ queryKey: ["compare-periods"] });
    void queryClient.invalidateQueries({ queryKey: ["heatmap"] });
    void queryClient.invalidateQueries({ queryKey: ["heatmap-polygon"] });

    setSubmitAttempted(false);
    setErrors({});
    onClose();
  }

  const isAllActive = draft.months === "all";

  return (
    <aside
      className={`
        flex w-64 shrink-0 flex-col overflow-hidden
        border-r border-[var(--color-border)] bg-[var(--color-bg)]
        fixed bottom-0 left-0 top-16 z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:static lg:top-auto lg:bottom-auto lg:z-auto lg:translate-x-0 lg:w-80
      `}
    >
      <div className="flex flex-1 flex-col overflow-y-auto p-4 space-y-6 lg:space-y-8">
        {/* // * Section 1 — Dataset */}
        <div>
          <SectionLabel text={t("sidebar.sections.dataset")} />
          <div className="flex flex-wrap gap-2">
            {Object.values(DATASETS).map((ds) => (
              <FilterChip
                key={ds}
                label={t(`sidebar.datasets.${ds}`)}
                isActive={draft.dataset === ds}
                onClick={() => handleDraftDatasetChange(ds)}
              />
            ))}
          </div>
        </div>

        {/* // * Section 2 — Period / Year */}
        {draft.dataset === DATASETS.CLIMATE && (
          <div>
            <SectionLabel text={t("sidebar.sections.climatePeriod")} />
            <Dropdown
              options={CLIMATE_PERIOD_OPTIONS}
              value={draft.climatePeriod}
              onChange={handleDraftClimatePeriodChange}
              className="w-full"
            />
            <p className="mt-1.5 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
              {t("sidebar.notes.climateNormals")}
            </p>
          </div>
        )}

        {draft.dataset === DATASETS.WEATHER && (
          <div>
            <SectionLabel text={t("sidebar.sections.yearRange")} />
            <PeriodSelectRow
              label=""
              hideDot={true}
              value={draft.weatherYearInput}
              onChange={handleDraftYearInputChange}
              error={errors["weatherYear"]}
              hint={`${WEATHER_MIN_YEAR}–${WEATHER_MAX_YEAR}`}
            />
            <p className="mt-1.5 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
              {t("sidebar.notes.weatherData")}
            </p>
          </div>
        )}

        {/* // * Section 3 — Variables */}
        <div>
          <SectionLabel text={t("sidebar.sections.variables")} />
          <div className="flex flex-wrap gap-2">
            {(draft.dataset === DATASETS.WEATHER ? WEATHER_VARIABLES : CLIMATE_VARIABLES).map(
              (v) => (
                <FilterChip
                  key={v}
                  label={t(`sidebar.variables.${v}`)}
                  isActive={draft.variables.includes(v)}
                  onClick={() => handleDraftVariableToggle(v)}
                />
              ),
            )}
          </div>
          {draft.dataset === DATASETS.WEATHER && (
            <p className="mt-1.5 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
              {t("sidebar.notes.weatherVariables")}
            </p>
          )}
        </div>

        {/* // * Section 4 — Grid resolution */}
        <div>
          <CellSizeSelector
            activeSize={draft.gridSize}
            options={cellSizeOptions}
            onSelect={handleDraftGridSizeChange}
          />
          {isHeatmapPage && cellStatus !== null && cellCount !== null && (
            <div className="mt-2 flex flex-col gap-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[length:var(--font-xs)] font-medium ${cellStatus.colorClass}`}
              >
                {t(cellStatus.labelKey)}
                <span className="opacity-70">({cellCount.toLocaleString()} cells)</span>
              </span>
              {isTooMany && (
                <p className="text-[length:var(--font-xs)] text-[var(--color-error)]">
                  {t("sidebar.cellCount.tooManyError")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* // * Section 5 — Months */}
        <div>
          <SectionLabel text={t("sidebar.sections.months")} />
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label={t("sidebar.months.all")}
              isActive={isAllActive}
              onClick={handleDraftSelectAllMonths}
            />
            {Array.from({ length: 12 }, (_, i) => {
              const monthNum = i + 1;
              const isActive = !isAllActive && (draft.months as number[]).includes(monthNum);
              return (
                <FilterChip
                  key={monthNum}
                  label={t(`months.${monthNum}`)}
                  isActive={isActive}
                  onClick={() => handleDraftMonthToggle(monthNum)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--color-border)] p-4">
        <button
          type="button"
          onClick={handleApplyAndClose}
          disabled={isTooMany}
          className="w-full rounded-[var(--radius-sm)] bg-[var(--color-primary)] py-2 text-[length:var(--font-base)] font-medium text-white transition-colors duration-150 hover:bg-[var(--color-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("sidebar.applyFilters")}
        </button>
      </div>
    </aside>
  );
}
