import { SearchBar, ThreeDotsScaleLoader } from "@/components";
import { PageWrapper } from "@/components/UI";
import type { TBbox } from "@/hooks";
import type { TWorldClimBoxBinding } from "@/types";
import { interpolateColor, type TColorScale } from "@/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  Rectangle,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { TDrawMode, TMapTarget, TPolygon, TRegionHeatmapViewProps } from "./HeatMap.type";
import { computeHeatmapStats, GRID_DELTA, iriToCellBounds, pixelAnnualAvg } from "./HeatMap.util";

// ─── Map child components (must live inside MapContainer) ──────────────────────

// Flies the map to a target location whenever the target reference changes.
function MapNavigator({ target }: { target: TMapTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], 10, { duration: 1 });
  }, [target, map]);
  return null;
}

// Fits the map to the given bbox once on mount; subsequent bbox changes don't re-fit.
function MapFitter({ bbox }: { bbox: TBbox | null }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!bbox || fitted.current) return;
    map.fitBounds(
      [
        [bbox.south, bbox.west],
        [bbox.north, bbox.east],
      ],
      { padding: [24, 24] },
    );
    fitted.current = true;
  }, [bbox, map]);

  return null;
}

type TBboxDrawerProps = {
  isDrawMode: boolean;
  onBboxComplete: (bbox: TBbox) => void;
};

function BboxDrawer({ isDrawMode, onBboxComplete }: TBboxDrawerProps) {
  const map = useMap();
  const [start, setStart] = useState<[number, number] | null>(null);
  const [current, setCurrent] = useState<[number, number] | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const container = map.getContainer();
    if (isDrawMode) {
      map.dragging.disable();
      container.style.cursor = "crosshair";
    } else {
      map.dragging.enable();
      container.style.cursor = "";
      isDragging.current = false;
      // start/current state is hidden by the render guard below — no setState needed here
    }
    return () => {
      map.dragging.enable();
      container.style.cursor = "";
    };
  }, [isDrawMode, map]);

  useMapEvents({
    mousedown(e) {
      if (!isDrawMode) return;
      isDragging.current = true;
      setStart([e.latlng.lat, e.latlng.lng]);
      setCurrent([e.latlng.lat, e.latlng.lng]);
    },
    mousemove(e) {
      if (!isDrawMode || !isDragging.current) return;
      setCurrent([e.latlng.lat, e.latlng.lng]);
    },
    mouseup(e) {
      if (!isDrawMode || !isDragging.current || !start) return;
      isDragging.current = false;
      const bbox: TBbox = {
        north: Math.max(start[0], e.latlng.lat),
        south: Math.min(start[0], e.latlng.lat),
        east: Math.max(start[1], e.latlng.lng),
        west: Math.min(start[1], e.latlng.lng),
      };
      onBboxComplete(bbox);
      setStart(null);
      setCurrent(null);
    },
  });

  if (!isDrawMode || !start || !current) return null;

  return (
    <Rectangle
      bounds={[start, current]}
      pathOptions={{
        color: "var(--color-primary)",
        fillOpacity: 0.12,
        weight: 2,
        dashArray: "6 4",
      }}
    />
  );
}

type TBboxOutlineProps = { bbox: TBbox };

function BboxOutline({ bbox }: TBboxOutlineProps) {
  return (
    <Rectangle
      bounds={[
        [bbox.south, bbox.west],
        [bbox.north, bbox.east],
      ]}
      pathOptions={{ color: "var(--color-primary)", fillOpacity: 0, weight: 2 }}
    />
  );
}

// Polygon is drawn click-by-click; clicking within CLOSE_PX of the first vertex closes it.
const CLOSE_PX = 14;

function PolygonDrawer({ onPolygonComplete }: { onPolygonComplete: (v: TPolygon) => void }) {
  const map = useMap();
  const [vertices, setVertices] = useState<[number, number][]>([]);
  const [cursor, setCursor] = useState<[number, number] | null>(null);
  const [snapToFirst, setSnapToFirst] = useState(false);

  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = "crosshair";
    return () => {
      container.style.cursor = "";
    };
  }, [map]);

  useMapEvents({
    mousemove(e) {
      const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setCursor(pos);
      if (vertices.length >= 3) {
        const first = map.latLngToContainerPoint(vertices[0]);
        const dx = first.x - e.containerPoint.x;
        const dy = first.y - e.containerPoint.y;
        setSnapToFirst(Math.sqrt(dx * dx + dy * dy) <= CLOSE_PX);
      } else {
        setSnapToFirst(false);
      }
    },
    click(e) {
      if (vertices.length >= 3) {
        const first = map.latLngToContainerPoint(vertices[0]);
        const dx = first.x - e.containerPoint.x;
        const dy = first.y - e.containerPoint.y;
        if (Math.sqrt(dx * dx + dy * dy) <= CLOSE_PX) {
          onPolygonComplete([...vertices]);
          return;
        }
      }
      setVertices((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
    },
  });

  if (vertices.length === 0) return null;

  const previewPath: [number, number][] = cursor ? [...vertices, cursor] : vertices;
  const showClosingLine = cursor !== null && vertices.length >= 2;

  return (
    <>
      <Polyline
        positions={previewPath}
        pathOptions={{ color: "var(--color-primary)", weight: 2, dashArray: "6 4" }}
      />
      {showClosingLine && (
        <Polyline
          positions={[cursor, vertices[0]]}
          pathOptions={{ color: "var(--color-primary)", weight: 1, dashArray: "4 4", opacity: 0.4 }}
        />
      )}
      {snapToFirst && (
        <CircleMarker
          center={vertices[0]}
          radius={8}
          pathOptions={{
            color: "var(--color-primary)",
            fillColor: "var(--color-primary)",
            fillOpacity: 0.4,
            weight: 2,
          }}
        />
      )}
    </>
  );
}

type TPolygonOutlineProps = { vertices: TPolygon };

function PolygonOutline({ vertices }: TPolygonOutlineProps) {
  return (
    <Polygon
      positions={vertices}
      pathOptions={{ color: "var(--color-primary)", fillOpacity: 0, weight: 2 }}
    />
  );
}

type THeatmapLayerProps = {
  bindings: TWorldClimBoxBinding[];
  gridSize: string;
  scale: TColorScale;
  bbox: TBbox | null;
  polygon: TPolygon | null;
};

function HeatmapLayer({ bindings, gridSize, scale, bbox, polygon }: THeatmapLayerProps) {
  const map = useMap();
  const groupRef = useRef<L.LayerGroup | null>(null);

  // Create layer group on map mount, remove on unmount
  useEffect(() => {
    const group = L.layerGroup().addTo(map);
    groupRef.current = group;
    return () => {
      group.remove();
      groupRef.current = null;
    };
  }, [map]);

  // Re-render tiles whenever data or scale changes
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();

    if (import.meta.env.DEV) {
      console.warn("[HeatmapLayer] bindings count:", bindings.length);
    }

    if (bindings.length === 0) return;

    const cellSize = GRID_DELTA[gridSize] ?? GRID_DELTA["10m"];

    const values = bindings.map((b) => pixelAnnualAvg(b)).filter((v) => !isNaN(v) && v !== 0);
    if (values.length === 0) return; // all zeros — view shows "no data" message

    const min = Math.min(...values);
    const max = Math.max(...values);

    let drawn = 0;
    for (const b of bindings) {
      const iri = b.pixel?.value;
      if (!iri) continue;
      const bounds = iriToCellBounds(iri, cellSize);
      if (!bounds) continue;
      const value = pixelAnnualAvg(b);
      if (value === 0 || isNaN(value)) continue;
      const color = interpolateColor(value, min, max, scale);
      L.rectangle(
        [
          [bounds.south, bounds.west],
          [bounds.north, bounds.east],
        ],
        { fillColor: color, fillOpacity: 0.75, stroke: false, weight: 0 },
      ).addTo(group);
      drawn++;
    }

    if (import.meta.env.DEV && drawn === 0) {
      console.warn("[HeatmapLayer] All IRI parses failed. First binding:", bindings[0]);
    }

    if (bbox) {
      map.fitBounds(
        [
          [bbox.south, bbox.west],
          [bbox.north, bbox.east],
        ],
        { padding: [24, 24] },
      );
    } else if (polygon && polygon.length >= 2) {
      const lats = polygon.map(([lat]) => lat);
      const lngs = polygon.map(([, lng]) => lng);
      map.fitBounds(
        [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ],
        { padding: [24, 24] },
      );
    }
  }, [bindings, gridSize, scale, bbox, polygon, map]);

  return null;
}

// ─── Non-map sub-components ────────────────────────────────────────────────────

type TToolbarProps = {
  drawMode: TDrawMode;
  hasSelection: boolean;
  onBboxModeToggle: () => void;
  onPolygonModeToggle: () => void;
  onClear: () => void;
};

function Toolbar({
  drawMode,
  hasSelection,
  onBboxModeToggle,
  onPolygonModeToggle,
  onClear,
}: TToolbarProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onBboxModeToggle}
        className={`flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-[length:var(--font-sm)] font-medium transition-colors duration-150 ${
          drawMode === "bbox"
            ? "border-[var(--color-primary)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]"
            : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
        }`}
      >
        <BoxIcon active={drawMode === "bbox"} />
        {t("heatMap.drawBbox")}
      </button>

      <button
        type="button"
        onClick={onPolygonModeToggle}
        className={`flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-[length:var(--font-sm)] font-medium transition-colors duration-150 ${
          drawMode === "polygon"
            ? "border-[var(--color-primary)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]"
            : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
        }`}
      >
        <PolygonIcon active={drawMode === "polygon"} />
        {t("heatMap.drawPolygon")}
      </button>

      {hasSelection && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
        >
          <ClearIcon />
          {t("heatMap.clearSelection")}
        </button>
      )}

      {drawMode !== "none" && (
        <span className="text-[length:var(--font-sm)] text-[var(--color-text-secondary)] italic">
          {drawMode === "polygon" ? t("heatMap.drawingPolygon") : t("heatMap.drawing")}
        </span>
      )}
    </div>
  );
}

function BoxIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="14"
        height="14"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeDasharray={active ? "none" : "4 2"}
      />
    </svg>
  );
}

function PolygonIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <polygon
        points="10,2 17.66,6 17.66,14 10,18 2.34,14 2.34,6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeDasharray={active ? "none" : "4 2"}
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

type TColorLegendProps = { min: number; max: number; scale: TColorScale; unit: string };

function ColorLegend({ min, max, scale, unit }: TColorLegendProps) {
  const gradientColors = Array.from({ length: 10 }, (_, i) =>
    interpolateColor(min + (max - min) * (i / 9), min, max, scale),
  );
  const gradient = `linear-gradient(to right, ${gradientColors.join(", ")})`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-5 w-full rounded" style={{ background: gradient }} />
      <div className="flex justify-between">
        <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
          {min.toFixed(1)} {unit}
        </span>
        <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
          {max.toFixed(1)} {unit}
        </span>
      </div>
    </div>
  );
}

function SkeletonLegend() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-5 w-full animate-pulse rounded bg-[var(--color-border)]" />
      <div className="flex justify-between">
        <div className="h-3 w-12 animate-pulse rounded bg-[var(--color-border)]" />
        <div className="h-3 w-12 animate-pulse rounded bg-[var(--color-border)]" />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      <div className="h-3 w-16 animate-pulse rounded bg-[var(--color-border)]" />
      <div className="h-7 w-20 animate-pulse rounded bg-[var(--color-border)]" />
    </div>
  );
}

type TStatCardProps = { label: string; value: string };

function StatCard({ label, value }: TStatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
        {label}
      </span>
      <span className="text-[length:var(--font-xl)] font-bold leading-none text-[var(--color-text)]">
        {value}
      </span>
    </div>
  );
}

// ─── Main view ─────────────────────────────────────────────────────────────────

export function HeatMapView({
  bbox,
  polygon,
  pixels,
  avg,
  gridSize,
  drawMode,
  isLoading,
  error,
  mapTarget,
  onDrawModeChange,
  onBboxChange,
  onPolygonChange,
  onCitySelect,
}: TRegionHeatmapViewProps) {
  const { t } = useTranslation();

  const pixelBindings = pixels?.results.bindings ?? [];
  const avgBinding = avg?.results.bindings[0] ?? null;
  const stats = computeHeatmapStats(pixelBindings, avgBinding);
  const hasData = stats.count > 0;
  const allZero = pixelBindings.length > 0 && stats.count === 0;
  const hasSelection = bbox !== null || polygon !== null;

  // Derive color scale from the variable URI of the first binding
  const variableIri = pixelBindings[0]?.variable?.value ?? "";
  const colorScale: TColorScale = variableIri.includes("Variable_prec")
    ? "precipitation"
    : "temperature";
  const unit = colorScale === "precipitation" ? "mm" : "°C";

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

        <SearchBar onCitySelect={onCitySelect} />

        <Toolbar
          drawMode={drawMode}
          hasSelection={hasSelection}
          onBboxModeToggle={() => onDrawModeChange(drawMode === "bbox" ? "none" : "bbox")}
          onPolygonModeToggle={() => onDrawModeChange(drawMode === "polygon" ? "none" : "polygon")}
          onClear={handleClear}
        />

        {/* Map */}
        <div
          className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-md"
          style={{ height: 520 }}
        >
          {isLoading && (
            <div className="absolute inset-0 z-[1500] flex flex-col items-center justify-center gap-3 bg-[var(--color-bg)]/70 backdrop-blur-sm">
              <ThreeDotsScaleLoader className="text-[var(--color-primary)]" size={80} />
            </div>
          )}
          <MapContainer center={[-21.13, 55.52]} zoom={9} className="w-full h-full" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFitter bbox={bbox} />
            <MapNavigator target={mapTarget} />

            <BboxDrawer isDrawMode={drawMode === "bbox"} onBboxComplete={onBboxChange} />

            {/* PolygonDrawer mounts only when active — unmounting resets its vertex state */}
            {drawMode === "polygon" && <PolygonDrawer onPolygonComplete={onPolygonChange} />}

            {bbox && drawMode !== "bbox" && <BboxOutline bbox={bbox} />}
            {polygon && drawMode !== "polygon" && <PolygonOutline vertices={polygon} />}

            <HeatmapLayer
              bindings={pixelBindings}
              gridSize={gridSize}
              scale={colorScale}
              bbox={bbox}
              polygon={polygon}
            />
          </MapContainer>
        </div>

        {/* Error */}
        {error && !isLoading && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-center text-[var(--color-error)]">
            {error.message}
          </div>
        )}

        {/* No selection prompt */}
        {!hasSelection && !isLoading && (
          <p className="text-center text-[var(--color-text-secondary)]">
            {t("heatMap.noSelection")}
          </p>
        )}

        {/* All-zero data — API returned bindings but every value is 0 */}
        {allZero && !isLoading && (
          <p className="text-center text-[var(--color-text-secondary)]">{t("heatMap.noData")}</p>
        )}

        {/* Bottom panel: legend + stats */}
        {(hasData || (hasSelection && isLoading && !allZero)) && (
          <div className="flex flex-col gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
              {hasData ? (
                <ColorLegend min={stats.min} max={stats.max} scale={colorScale} unit={unit} />
              ) : (
                <SkeletonLegend />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {hasData ? (
                <>
                  <StatCard
                    label={t("heatMap.stats.minValue")}
                    value={`${stats.min.toFixed(1)} ${unit}`}
                  />
                  <StatCard
                    label={t("heatMap.stats.maxValue")}
                    value={`${stats.max.toFixed(1)} ${unit}`}
                  />
                  <StatCard
                    label={t("heatMap.stats.avgValue")}
                    value={`${stats.avg.toFixed(1)} ${unit}`}
                  />
                  <StatCard label={t("heatMap.stats.cellsAnalyzed")} value={String(stats.count)} />
                </>
              ) : (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
