import { interpolateColor } from "@/utils";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { THeatmapLayerProps } from "../HeatMap.type";
import { GRID_DELTA, iriToCellBounds, pixelAnnualAvg } from "../HeatMap.util";

export function HeatmapLayer({ bindings, gridSize, scale, bbox, polygon }: THeatmapLayerProps) {
  const map = useMap();
  const groupRef = useRef<L.LayerGroup | null>(null);
  const prevSelectionRef = useRef<{ bbox: typeof bbox; polygon: typeof polygon }>({
    bbox: null,
    polygon: null,
  });

  useEffect(() => {
    const group = L.layerGroup().addTo(map);
    groupRef.current = group;
    return () => {
      group.remove();
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();

    if (import.meta.env.DEV) {
      console.warn("[HeatmapLayer] bindings count:", bindings.length, "| first:", bindings[0]);
    }

    if (bindings.length === 0) return;

    const cellSize = GRID_DELTA[gridSize] ?? GRID_DELTA["10m"];

    const values = bindings.map((b) => pixelAnnualAvg(b)).filter((v) => !isNaN(v));
    if (values.length === 0) return;

    const min = Math.min(...values);
    const max = Math.max(...values);

    let drawn = 0;
    let latLngUsed = 0;
    let iriUsed = 0;

    for (const b of bindings) {
      const value = pixelAnnualAvg(b);
      if (isNaN(value)) continue;

      // Primary: use lat/lng from binding (center of pixel) — avoids IRI regex dependency
      const bLat = parseFloat(b.lat?.value ?? "");
      const bLng = parseFloat(b.lng?.value ?? "");
      let bounds: { north: number; south: number; west: number; east: number } | null = null;

      if (!isNaN(bLat) && !isNaN(bLng)) {
        bounds = {
          north: bLat + cellSize / 2,
          south: bLat - cellSize / 2,
          west: bLng - cellSize / 2,
          east: bLng + cellSize / 2,
        };
        latLngUsed++;
      } else {
        // * Fallback: parse row/col from pixel IRI
        const iri = b.pixel?.value;
        if (iri) bounds = iriToCellBounds(iri, cellSize);
        if (bounds) iriUsed++;
      }

      if (!bounds) continue;

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

    if (import.meta.env.DEV) {
      console.warn(
        `[HeatmapLayer] drawn=${drawn} latLng=${latLngUsed} iri=${iriUsed} skipped=${bindings.length - drawn}`,
      );
    }

    const selectionChanged =
      prevSelectionRef.current.bbox !== bbox || prevSelectionRef.current.polygon !== polygon;
    prevSelectionRef.current = { bbox, polygon };

    if (!selectionChanged) return;

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
