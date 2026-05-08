import type { TMiniMapLocation } from "@/components";
import {
  MiniMap,
  PeriodSelectRow,
  SearchBar,
  TempPrecipChart,
  ThreeDotsScaleLoader,
} from "@/components";
import { Dropdown } from "@/components/UI";
import { PageWrapper } from "@/components/UI";
import { CELL_SIZE_OPTIONS, CLIMATE_PERIOD_LABELS, CLIMATE_PERIODS, DATASETS } from "@/constants";
import type { TClimatePeriod } from "@/constants/worldclim.constant";
import {
  CLIMATE_COMPARISON_COLORS,
  computeCompareStats,
} from "@/pages/ClimateComparison/ClimateComparison.util";
import { useTranslation } from "react-i18next";
import type {
  TCitySearchRowProps,
  TClimatePeriodRowProps,
  TComparePeriodsViewProps,
  TDiffCardProps,
  TStatsGridProps,
} from "./ComparePeriods.type";

const CLIMATE_PERIOD_OPTIONS = Object.values(CLIMATE_PERIODS).map((period) => ({
  value: period,
  label: CLIMATE_PERIOD_LABELS[period],
}));

function CitySearchRow({ label, dotColor, defaultValue, onCitySelect }: TCitySearchRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
        <span className="text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)]">
          {label}
        </span>
      </div>
      <SearchBar defaultValue={defaultValue} onCitySelect={onCitySelect} />
    </div>
  );
}

function ClimatePeriodRow({ label, dotColor, value, onChange }: TClimatePeriodRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
        <span className="text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)]">
          {label}
        </span>
      </div>
      <Dropdown
        options={CLIMATE_PERIOD_OPTIONS}
        value={value}
        onChange={(v) => {
          const period = Object.values(CLIMATE_PERIODS).find((p) => p === v);
          if (period) onChange(period as TClimatePeriod);
        }}
      />
    </div>
  );
}

function StatsGrid({ labelA, labelB, statsA, statsB }: TStatsGridProps) {
  const { t } = useTranslation();

  const rows = [
    {
      label: t("climateComparison.stats.avgTmax"),
      a: `${statsA.avgTmax.toFixed(1)} °C`,
      b: `${statsB.avgTmax.toFixed(1)} °C`,
    },
    {
      label: t("climateComparison.stats.avgTmin"),
      a: `${statsA.avgTmin.toFixed(1)} °C`,
      b: `${statsB.avgTmin.toFixed(1)} °C`,
    },
    {
      label: t("climateComparison.stats.totalPrec"),
      a: `${statsA.totalPrec.toFixed(0)} mm`,
      b: `${statsB.totalPrec.toFixed(0)} mm`,
    },
  ];

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <table className="w-full table-fixed text-[length:var(--font-sm)]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <th className="px-4 py-2.5 text-left font-medium text-[var(--color-text-secondary)]" />
            <th
              className="px-4 py-2.5 text-center font-semibold"
              style={{ color: CLIMATE_COMPARISON_COLORS.A.tmax }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: CLIMATE_COMPARISON_COLORS.A.tmax }}
                />
                {labelA}
              </span>
            </th>
            <th
              className="px-4 py-2.5 text-center font-semibold"
              style={{ color: CLIMATE_COMPARISON_COLORS.B.tmax }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: CLIMATE_COMPARISON_COLORS.B.tmax }}
                />
                {labelB}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              className={`border-b border-[var(--color-border)] last:border-0 ${i % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"}`}
            >
              <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{row.label}</td>
              <td
                className="px-4 py-2.5 text-center font-semibold"
                style={{ color: CLIMATE_COMPARISON_COLORS.A.tmax }}
              >
                {row.a}
              </td>
              <td
                className="px-4 py-2.5 text-center font-semibold"
                style={{ color: CLIMATE_COMPARISON_COLORS.B.tmax }}
              >
                {row.b}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DiffCard({ title, value, sub, valueColor }: TDiffCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
        {title}
      </span>
      <span
        className="text-[length:var(--font-lg)] font-bold leading-snug"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
      <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">{sub}</span>
    </div>
  );
}

export function ComparePeriodsView({
  city,
  dataset,
  climatePeriodA,
  climatePeriodB,
  yearA,
  yearB,
  dataA,
  dataB,
  autoGrid,
  isLoading,
  error,
  onCitySelect,
  onClimatePeriodAChange,
  onClimatePeriodBChange,
  onYearAChange,
  onYearBChange,
}: TComparePeriodsViewProps) {
  const { t } = useTranslation();

  const isClimate = dataset === DATASETS.CLIMATE;

  const labelA = isClimate ? CLIMATE_PERIOD_LABELS[climatePeriodA] : String(yearA);
  const labelB = isClimate ? CLIMATE_PERIOD_LABELS[climatePeriodB] : String(yearB);

  const hasBothData = dataA.length > 0 && dataB.length > 0;
  const statsA = hasBothData ? computeCompareStats(dataA) : null;
  const statsB = hasBothData ? computeCompareStats(dataB) : null;
  const tmaxDiff = statsA && statsB ? statsB.avgTmax - statsA.avgTmax : null;
  const precDiff = statsA && statsB ? statsB.totalPrec - statsA.totalPrec : null;

  const miniMapLocations: TMiniMapLocation[] =
    city !== null
      ? [
          {
            lat: city.lat,
            lng: city.lng,
            label: city.label,
            color: CLIMATE_COMPARISON_COLORS.A.tmax,
          },
        ]
      : [];

  return (
    <PageWrapper>
      <div className="flex flex-col gap-10">
        <header className="text-center">
          <h1 className="mb-2 text-[length:var(--font-xl)] lg:text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
            {t("comparePeriods.title")}
          </h1>
        </header>

        <p className="text-center text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
          {t("climateComparison.autoResolution", { resolution: CELL_SIZE_OPTIONS[autoGrid] })}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 flex flex-col gap-4">
            <CitySearchRow
              key={city?.id ?? "empty"}
              label={t("climateComparison.searchCity")}
              dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
              defaultValue={city?.label ?? ""}
              onCitySelect={onCitySelect}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isClimate ? (
                <>
                  <ClimatePeriodRow
                    label={t("climateComparison.periodA")}
                    dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
                    value={climatePeriodA}
                    onChange={onClimatePeriodAChange}
                  />
                  <ClimatePeriodRow
                    label={t("climateComparison.periodB")}
                    dotColor={CLIMATE_COMPARISON_COLORS.B.tmax}
                    value={climatePeriodB}
                    onChange={onClimatePeriodBChange}
                  />
                </>
              ) : (
                <>
                  <PeriodSelectRow
                    label={t("climateComparison.periodA")}
                    dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
                    value={String(yearA)}
                    onChange={(val) => {
                      const n = parseInt(val, 10);
                      if (!isNaN(n)) onYearAChange(n);
                    }}
                  />
                  <PeriodSelectRow
                    label={t("climateComparison.periodB")}
                    dotColor={CLIMATE_COMPARISON_COLORS.B.tmax}
                    value={String(yearB)}
                    onChange={(val) => {
                      const n = parseInt(val, 10);
                      if (!isNaN(n)) onYearBChange(n);
                    }}
                  />
                </>
              )}
            </div>
          </div>

          <div className="h-[120px] w-full shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm sm:h-[160px] sm:w-[260px]">
            <MiniMap locations={miniMapLocations} activeIndex={0} onToggle={() => undefined} />
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-12">
            <ThreeDotsScaleLoader className="text-[var(--color-primary)]" size={80} />
          </div>
        )}

        {error && !isLoading && (
          <div className="px-4 py-3 text-center text-[var(--color-error)] bg-[var(--color-error-bg)] rounded-[var(--radius-md)] border border-[var(--color-error-border)]">
            {error.message}
          </div>
        )}

        {!hasBothData && !isLoading && !error && (
          <p className="text-center text-[var(--color-text-secondary)]">
            {t("climateComparison.noDataPeriods")}
          </p>
        )}

        {hasBothData && statsA && statsB && (
          <StatsGrid labelA={labelA} labelB={labelB} statsA={statsA} statsB={statsB} />
        )}

        {hasBothData && (
          <TempPrecipChart
            dataA={dataA}
            dataB={dataB}
            labelA={labelA}
            labelB={labelB}
            compareMode="periods"
            cityName={city?.label ?? ""}
            subtitle={{ rawLabel: `${labelA} vs ${labelB}` }}
            showWalterLiethToggle={false}
            showAridity={false}
          />
        )}

        {hasBothData && tmaxDiff !== null && precDiff !== null && (
          <div className="grid grid-cols-2 gap-3">
            <DiffCard
              title={t("comparePeriods.trend.tempTitle")}
              value={
                tmaxDiff === 0
                  ? t("comparePeriods.trend.noChange")
                  : `${tmaxDiff > 0 ? "+" : ""}${tmaxDiff.toFixed(1)}°C`
              }
              sub={`${labelB} vs ${labelA}`}
              valueColor={
                tmaxDiff > 0
                  ? CLIMATE_COMPARISON_COLORS.B.tmax
                  : tmaxDiff < 0
                    ? CLIMATE_COMPARISON_COLORS.A.tmax
                    : undefined
              }
            />
            <DiffCard
              title={t("comparePeriods.trend.precipTitle")}
              value={
                precDiff === 0
                  ? t("comparePeriods.trend.noChange")
                  : `${precDiff > 0 ? "+" : ""}${precDiff.toFixed(0)} mm`
              }
              sub={`${labelB} vs ${labelA}`}
              valueColor={
                precDiff > 0
                  ? CLIMATE_COMPARISON_COLORS.B.tmax
                  : precDiff < 0
                    ? CLIMATE_COMPARISON_COLORS.A.tmax
                    : undefined
              }
            />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
