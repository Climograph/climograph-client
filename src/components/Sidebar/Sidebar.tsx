import { CellSizeSelector, FilterChip, SectionLabel } from "@/components";
import { Dropdown } from "@/components/UI";
import { DATASETS, ROUTES, SIDEBAR_PARAMS, SIDEBAR_VARIABLES } from "@/constants";
import { CELL_SIZE_OPTIONS } from "@/constants/worldclim.constant";
import { PERIOD_WINDOW_OPTIONS } from "@/hooks";
import { useFiltersStore } from "@/stores";
import type { TCellSize, TVariable } from "@/types";
import type { TCellSizeOption } from "@/types/ui/cell-size";
import { estimateCellCount, getCellCountStatus } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";
import type { TSidebarProps } from "./Sidebar.type";

export function Sidebar({ isOpen, onClose }: TSidebarProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const {
    dataset,
    periodStart,
    variables,
    gridSize,
    months,
    actions: {
      setDataset,
      setPeriodStart,
      toggleVariable,
      setGridSize,
      toggleMonth,
      selectAllMonths,
    },
  } = useFiltersStore();

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
    isHeatmapPage && heatmapBbox !== null ? estimateCellCount(heatmapBbox, gridSize) : null;
  const cellStatus = cellCount !== null ? getCellCountStatus(cellCount) : null;
  const isTooMany = cellCount !== null && cellCount > 10_000;

  const cellSizeOptions: readonly TCellSizeOption[] = (
    Object.keys(CELL_SIZE_OPTIONS) as TCellSize[]
  ).map((value) => ({ value, label: t(`cellSizes.${value}`) }));

  const periodWindowStart = String(periodStart);

  function handlePeriodChange(value: string) {
    setPeriodStart(Number(value));
  }

  function handleApplyAndClose() {
    void queryClient.invalidateQueries({ queryKey: ["climate"] });
    void queryClient.invalidateQueries({ queryKey: ["compare"] });
    void queryClient.invalidateQueries({ queryKey: ["compare-periods"] });
    void queryClient.invalidateQueries({ queryKey: ["heatmap"] });
    void queryClient.invalidateQueries({ queryKey: ["heatmap-polygon"] });
    onClose();
  }

  const isAllActive = months === "all";

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
        <div>
          <SectionLabel text={t("sidebar.sections.dataset")} />
          <div className="flex flex-wrap gap-2">
            {Object.values(DATASETS).map((ds) => (
              <FilterChip
                key={ds}
                label={t(`sidebar.datasets.${ds}`)}
                isActive={dataset === ds}
                onClick={() => setDataset(ds)}
              />
            ))}
          </div>
        </div>

        {dataset === DATASETS.WEATHER && (
          <div>
            <SectionLabel text={t("sidebar.sections.yearRange")} />
            <Dropdown
              options={PERIOD_WINDOW_OPTIONS}
              value={periodWindowStart}
              onChange={handlePeriodChange}
              className="w-full"
            />
          </div>
        )}

        <div>
          <SectionLabel text={t("sidebar.sections.variables")} />
          <div className="flex flex-wrap gap-2">
            {(SIDEBAR_VARIABLES as readonly TVariable[]).map((v) => (
              <FilterChip
                key={v}
                label={t(`sidebar.variables.${v}`)}
                isActive={variables.includes(v)}
                onClick={() => toggleVariable(v)}
              />
            ))}
          </div>
        </div>

        <div>
          <CellSizeSelector
            activeSize={gridSize}
            options={cellSizeOptions}
            onSelect={setGridSize}
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

        <div>
          <SectionLabel text={t("sidebar.sections.months")} />
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label={t("sidebar.months.all")}
              isActive={isAllActive}
              onClick={selectAllMonths}
            />
            {Array.from({ length: 12 }, (_, i) => {
              const monthNum = i + 1;
              const isActive = !isAllActive && months.includes(monthNum);
              return (
                <FilterChip
                  key={monthNum}
                  label={t(`months.${monthNum}`)}
                  isActive={isActive}
                  onClick={() => toggleMonth(monthNum)}
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
