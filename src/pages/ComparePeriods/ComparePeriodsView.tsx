import type { TMiniMapLocation } from "@/components";
import {
  CompareStatsGrid,
  DiffCard,
  MiniMap,
  PeriodSelectRow,
  SearchBar,
  TempPrecipChart,
  ThreeDotsScaleLoader,
} from "@/components";
import { Dropdown, PageWrapper } from "@/components/UI";
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
  selectedMonths,
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

  const miniMapLocations: TMiniMapLocation[] = [
    { lat: city.lat, lng: city.lng, label: city.label, color: CLIMATE_COMPARISON_COLORS.A.tmax },
  ];

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
              key={city.id}
              label={t("climateComparison.searchCity")}
              dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
              defaultValue={city.label}
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
          <CompareStatsGrid labelA={labelA} labelB={labelB} statsA={statsA} statsB={statsB} />
        )}

        {hasBothData && (
          <TempPrecipChart
            dataA={dataA}
            dataB={dataB}
            labelA={labelA}
            labelB={labelB}
            compareMode="periods"
            cityName={city.label}
            subtitle={{ rawLabel: `${labelA} vs ${labelB}` }}
            showWalterLiethToggle={false}
            showAridity={false}
            {...(selectedMonths !== null && selectedMonths.length > 0 ? { selectedMonths } : {})}
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
