import { LocationSearch } from "@/components";
import { PageWrapper } from "@/components/UI";
import { useTranslation } from "react-i18next";
import type { TRegionHeatmapViewProps } from "./HeatMap.type";
import { computeHeatmapStats, formatSelectedMonths, shortGridLabel } from "./HeatMap.util";
import { LegendPanel } from "./components/ColorLegend";
import { MapCanvas } from "./components/MapCanvas";
import { StatsGrid } from "./components/StatCards";
import { Toolbar } from "./components/Toolbar";

export function HeatMapView({
  bbox,
  polygon,
  pixels,
  avg,
  gridSize,
  activeVariable,
  colorScale,
  drawMode,
  isLoading,
  isLocating,
  error,
  locationError,
  mapTarget,
  selectedMonths,
  periodLabel,
  onDrawModeChange,
  onBboxChange,
  onPolygonChange,
  onCitySelect,
  onLocate,
  onClearLocationError,
}: TRegionHeatmapViewProps) {
  const { t } = useTranslation();

  const pixelBindings = pixels?.results.bindings ?? [];
  const avgBinding = avg?.results.bindings[0] ?? null;
  const stats = computeHeatmapStats(pixelBindings, avgBinding);
  const hasData = stats.count > 0;
  const hasNoData = pixelBindings.length > 0 && stats.count === 0;
  const hasSelection = bbox !== null || polygon !== null;
  const unit = colorScale === "precipitation" ? "mm" : "°C";

  const showDataSection = hasData || (hasSelection && isLoading && !hasNoData);

  const monthStr = formatSelectedMonths(selectedMonths);
  const periodPart = monthStr ? `${monthStr} · ${periodLabel}` : periodLabel;
  const summaryLine = t("heatMap.summaryLine", {
    count: stats.count,
    period: periodPart,
    variable: activeVariable,
    grid: shortGridLabel(gridSize),
  });

  function handleClear() {
    onBboxChange(null);
    onPolygonChange(null);
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-8">
        <header className="text-center">
          <h1 className="mb-2 text-[length:var(--font-xl)] lg:text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
            {t("heatMap.title")}
          </h1>
        </header>

        <LocationSearch
          isLocating={isLocating}
          locationError={locationError}
          showLocateButton={false}
          onCitySelect={onCitySelect}
          onLocate={onLocate}
          onClearLocationError={onClearLocationError}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Toolbar
            drawMode={drawMode}
            hasSelection={hasSelection}
            isLocating={isLocating}
            onBboxModeToggle={() => onDrawModeChange(drawMode === "bbox" ? "none" : "bbox")}
            onPolygonModeToggle={() =>
              onDrawModeChange(drawMode === "polygon" ? "none" : "polygon")
            }
            onClear={handleClear}
            onLocate={onLocate}
          />
          <span className="text-[length:var(--font-sm)] text-[var(--color-text-secondary)]">
            {t("heatMap.showingVariable", { variable: activeVariable })}
          </span>
        </div>

        {showDataSection && <StatsGrid hasData={hasData} stats={stats} unit={unit} />}

        <MapCanvas
          bbox={bbox}
          polygon={polygon}
          drawMode={drawMode}
          gridSize={gridSize}
          colorScale={colorScale}
          mapTarget={mapTarget}
          bindings={pixelBindings}
          isLoading={isLoading}
          selectedMonths={selectedMonths}
          onBboxComplete={onBboxChange}
          onPolygonComplete={onPolygonChange}
        />

        {error && !isLoading && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-center text-[var(--color-error)]">
            {error.message}
          </div>
        )}

        {!hasSelection && !isLoading && (
          <p className="text-center text-[var(--color-text-secondary)]">
            {t("heatMap.noSelection")}
          </p>
        )}

        {hasNoData && !isLoading && (
          <p className="text-center text-[var(--color-text-secondary)]">{t("heatMap.noData")}</p>
        )}

        {showDataSection && (
          <div className="flex flex-col gap-3">
            <LegendPanel hasData={hasData} stats={stats} scale={colorScale} unit={unit} />
            {hasData && (
              <p className="text-center text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
                {summaryLine}
              </p>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
