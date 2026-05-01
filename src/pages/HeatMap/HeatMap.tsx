import { DATASETS, SIDEBAR_PARAMS } from "@/constants";
import { useGetHeatmapData, useGetHeatmapPolygonData } from "@/hooks";
import type { TBbox } from "@/hooks";
import { useFiltersStore } from "@/stores";
import type { TWikidataCity } from "@/types";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { TDrawMode, TMapTarget, TPolygon } from "./HeatMap.type";
import { polygonToWkt } from "./HeatMap.util";
import { HeatMapView } from "./HeatMapView";

export function HeatMap() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawMode, setDrawMode] = useState<TDrawMode>("none");
  const [polygon, setPolygon] = useState<TPolygon | null>(null);
  const [mapTarget, setMapTarget] = useState<TMapTarget | null>(null);

  const { dataset, climatePeriod, weatherYear, gridSize: grid, variables } = useFiltersStore();
  const isClimate = dataset === DATASETS.CLIMATE;
  const year = isClimate ? undefined : weatherYear;
  const activeVariable = variables[0] ?? "tmax";

  // Bbox from URL search params — null until user draws
  const northRaw = searchParams.get(SIDEBAR_PARAMS.BBOX_NORTH);
  const southRaw = searchParams.get(SIDEBAR_PARAMS.BBOX_SOUTH);
  const westRaw = searchParams.get(SIDEBAR_PARAMS.BBOX_WEST);
  const eastRaw = searchParams.get(SIDEBAR_PARAMS.BBOX_EAST);
  const bbox: TBbox | null =
    northRaw !== null && southRaw !== null && westRaw !== null && eastRaw !== null
      ? {
          north: Number(northRaw),
          south: Number(southRaw),
          west: Number(westRaw),
          east: Number(eastRaw),
        }
      : null;

  const wkt = polygon ? polygonToWkt(polygon) : null;

  const {
    pixels: bboxPixels,
    avg: bboxAvg,
    isLoading: bboxLoading,
    error: bboxError,
  } = useGetHeatmapData(
    polygon ? null : bbox,
    grid,
    activeVariable,
    isClimate,
    climatePeriod,
    year,
  );

  const {
    pixels: polyPixels,
    avg: polyAvg,
    isLoading: polyLoading,
    error: polyError,
  } = useGetHeatmapPolygonData(wkt, grid, activeVariable, isClimate, climatePeriod, year);

  const pixels = polygon ? polyPixels : bboxPixels;
  const avg = polygon ? polyAvg : bboxAvg;
  const isLoading = polygon ? polyLoading : bboxLoading;
  const error = polygon ? polyError : bboxError;

  function handleDrawModeChange(mode: TDrawMode) {
    setDrawMode(mode);
  }

  function setBboxInUrl(next: TBbox | null) {
    const nextParams = new URLSearchParams(searchParams);
    if (next) {
      nextParams.set(SIDEBAR_PARAMS.BBOX_NORTH, String(next.north));
      nextParams.set(SIDEBAR_PARAMS.BBOX_SOUTH, String(next.south));
      nextParams.set(SIDEBAR_PARAMS.BBOX_WEST, String(next.west));
      nextParams.set(SIDEBAR_PARAMS.BBOX_EAST, String(next.east));
    } else {
      nextParams.delete(SIDEBAR_PARAMS.BBOX_NORTH);
      nextParams.delete(SIDEBAR_PARAMS.BBOX_SOUTH);
      nextParams.delete(SIDEBAR_PARAMS.BBOX_WEST);
      nextParams.delete(SIDEBAR_PARAMS.BBOX_EAST);
    }
    setSearchParams(nextParams, { replace: true });
  }

  function handleBboxChange(next: TBbox | null) {
    setDrawMode("none");
    if (next) setPolygon(null);
    setBboxInUrl(next);
  }

  function handlePolygonChange(next: TPolygon | null) {
    setDrawMode("none");
    setPolygon(next);
    if (next) setBboxInUrl(null);
  }

  function handleCitySelect(city: TWikidataCity) {
    setMapTarget({ lat: city.lat, lng: city.lng });
  }

  return (
    <HeatMapView
      bbox={bbox}
      polygon={polygon}
      pixels={pixels}
      avg={avg}
      gridSize={grid}
      drawMode={drawMode}
      isLoading={isLoading}
      error={error}
      mapTarget={mapTarget}
      onDrawModeChange={handleDrawModeChange}
      onBboxChange={handleBboxChange}
      onPolygonChange={handlePolygonChange}
      onCitySelect={handleCitySelect}
    />
  );
}
