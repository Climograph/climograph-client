/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CellSizeSelector, FilterChip, SectionLabel } from "@/components";
import { Dropdown } from "@/components/UI";
import { DATASETS, MONTHS_ARRAY, SIDEBAR_VARIABLES } from "@/constants";
import { PERIOD_WINDOW_OPTIONS, useSidebarFilters } from "@/hooks";
import type { TMonthFilter, TVariable } from "@/types";
import { useTranslation } from "react-i18next";
import type { TSidebarProps } from "./Sidebar.type";

export function Sidebar({ isOpen, onClose }: TSidebarProps) {
  const { t } = useTranslation();
  const {
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
  } = useSidebarFilters();

  const handleApplyAndClose = () => {
    handleApply();
    onClose();
  };

  const monthOptions: { value: TMonthFilter; label: string }[] = [
    { value: "all", label: t("sidebar.months.all") },
    ...MONTHS_ARRAY.map((name, i) => ({ value: String(i + 1) as TMonthFilter, label: name })),
  ];

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
              onChange={setPeriodWindowStart}
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
          <CellSizeSelector activeSize={grid} options={cellSizeOptions} onSelect={setGrid} />
        </div>

        <div>
          <SectionLabel text={t("sidebar.sections.months")} />
          <div className="flex flex-wrap gap-2">
            {monthOptions.map(({ value, label }) => (
              <FilterChip
                key={value}
                label={label}
                isActive={month === value}
                onClick={() => setMonth(value)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--color-border)] p-4">
        <button
          type="button"
          onClick={handleApplyAndClose}
          className="w-full rounded-[var(--radius-sm)] bg-[var(--color-primary)] py-2 text-[length:var(--font-base)] font-medium text-white transition-colors duration-150 hover:bg-[var(--color-dark)]"
        >
          {t("sidebar.applyFilters")}
        </button>
      </div>
    </aside>
  );
}
