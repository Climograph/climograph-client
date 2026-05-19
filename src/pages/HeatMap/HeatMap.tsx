import { CLIMATE_PERIOD_LABELS, DATASETS, SIDEBAR_PARAMS, VARIABLE_LABELS } from "@/constants";
import {
  useGeolocation,
  useGetHeatmapData,
  useGetHeatmapPolygonData,
  useGetRegionalProfile,
} from "@/hooks";
import { useFiltersStore } from "@/stores";
import type { TBbox, TColorScale, TWikidataCity } from "@/types";
import {
  encodeVars,
  parseCellSize,
  parseDataset,
  parsePeriod,
  parseVars,
  parseYear,
} from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import type { TDrawMode, TMapTarget, TPolygon } from "./HeatMap.type";
import { computeRegionalProfile, polygonToWkt, wktToPolygon } from "./HeatMap.util";
import { HeatMapView } from "./HeatMapView";

export function HeatMap() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawMode, setDrawMode] = useState<TDrawMode>("none");

  // Restore polygon from URL on mount; lazy initializer reads searchParams once
  // URLSearchParams.get() already URL-decodes, so no extra decodeURIComponent needed
  const [polygon, setPolygon] = useState<TPolygon | null>(() => {
    const raw = searchParams.get(SIDEBAR_PARAMS.POLYGON);
    return raw !== null ? wktToPolygon(raw) : null;
  });

  const [mapTarget, setMapTarget] = useState<TMapTarget | null>(null);
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();

  const {
    dataset,
    climatePeriod,
    weatherYear,
    gridSize: grid,
    variables,
    months,
  } = useFiltersStore();
  const isClimate = dataset === DATASETS.CLIMATE;
  const year = isClimate ? undefined : weatherYear;
  const selectedMonths: number[] = months === "all" ? [] : months;
  const periodLabel = isClimate ? CLIMATE_PERIOD_LABELS[climatePeriod] : String(weatherYear);
  const activeVariable = variables[0] ?? "tmax";
  const colorScale: TColorScale = activeVariable === "prec" ? "precipitation" : "temperature";

  // Bbox from URL search params
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

  // Restore global filters from URL once on mount
  useEffect(() => {
    const store = useFiltersStore.getState();

    const ds = parseDataset(searchParams.get(SIDEBAR_PARAMS.DATASET));
    if (ds !== null) store.actions.setDataset(ds);

    const period = parsePeriod(searchParams.get(SIDEBAR_PARAMS.PERIOD));
    if (period !== null) store.actions.setClimatePeriod(period);

    const yr = parseYear(searchParams.get(SIDEBAR_PARAMS.YEAR));
    if (yr !== null) store.actions.setWeatherYear(yr);

    const vars = parseVars(searchParams.get(SIDEBAR_PARAMS.VAR));
    if (vars !== null) store.actions.setVariables(vars);

    const gridSize = parseCellSize(searchParams.get(SIDEBAR_PARAMS.GRID));
    if (gridSize !== null) store.actions.setGridSize(gridSize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync filter params → URL (replace); separate from bbox/polygon writers
  const varsStr = useMemo(() => encodeVars(variables), [variables]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    let changed = false;

    function maybeSet(key: string, value: string) {
      if (nextParams.get(key) !== value) {
        nextParams.set(key, value);
        changed = true;
      }
    }
    function maybeDelete(key: string) {
      if (nextParams.has(key)) {
        nextParams.delete(key);
        changed = true;
      }
    }

    maybeSet(SIDEBAR_PARAMS.DATASET, dataset);
    maybeSet(SIDEBAR_PARAMS.VAR, varsStr);
    maybeSet(SIDEBAR_PARAMS.GRID, grid);

    if (isClimate) {
      maybeSet(SIDEBAR_PARAMS.PERIOD, climatePeriod);
      maybeDelete(SIDEBAR_PARAMS.YEAR);
    } else {
      maybeSet(SIDEBAR_PARAMS.YEAR, String(weatherYear));
      maybeDelete(SIDEBAR_PARAMS.PERIOD);
    }

    if (changed) setSearchParams(nextParams, { replace: true });
  }, [
    dataset,
    climatePeriod,
    weatherYear,
    isClimate,
    varsStr,
    grid,
    searchParams,
    setSearchParams,
  ]);

  // Document title
  useEffect(() => {
    const varLabel = VARIABLE_LABELS[activeVariable] ?? activeVariable;
    const periodStr = isClimate
      ? (CLIMATE_PERIOD_LABELS[climatePeriod] ?? climatePeriod)
      : String(weatherYear);
    document.title = `Region Heatmap · ${varLabel} ${periodStr} | Climatica`;
  }, [activeVariable, isClimate, climatePeriod, weatherYear]);

  const wkt = polygon ? polygonToWkt(polygon) : null;

  const {
    pixels: bboxPixels,
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
    isLoading: polyLoading,
    error: polyError,
  } = useGetHeatmapPolygonData(wkt, grid, activeVariable, isClimate, climatePeriod, year);

  const pixels = polygon ? polyPixels : bboxPixels;
  const isLoading = polygon ? polyLoading : bboxLoading;
  const error = polygon ? polyError : bboxError;

  const hasData = (pixels?.results.bindings.length ?? 0) > 0;

  const { profileData, isProfileLoading } = useGetRegionalProfile(
    polygon ? null : bbox,
    wkt,
    grid,
    isClimate,
    climatePeriod,
    year,
    hasData,
  );

  const profile = profileData
    ? computeRegionalProfile(profileData.tmax, profileData.tmin, profileData.prec)
    : null;

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

  function setPolygonInUrl(next: TPolygon | null) {
    const nextParams = new URLSearchParams(searchParams);
    if (next) {
      nextParams.set(SIDEBAR_PARAMS.POLYGON, polygonToWkt(next));
    } else {
      nextParams.delete(SIDEBAR_PARAMS.POLYGON);
    }
    setSearchParams(nextParams, { replace: true });
  }

  function handleBboxChange(next: TBbox | null) {
    setDrawMode("none");
    if (next) {
      setPolygon(null);
      setPolygonInUrl(null);
    }
    setBboxInUrl(next);
  }

  function handlePolygonChange(next: TPolygon | null) {
    setDrawMode("none");
    setPolygon(next);
    if (next) setBboxInUrl(null);
    setPolygonInUrl(next);
  }

  function handleCitySelect(city: TWikidataCity) {
    setMapTarget({ lat: city.lat, lng: city.lng });
  }

  function handleLocate() {
    locate(handleCitySelect);
  }

  const resolvedLocationError = locationError !== null ? t(locationError) : null;

  return (
    <HeatMapView
      bbox={bbox}
      polygon={polygon}
      pixels={pixels}
      gridSize={grid}
      activeVariable={activeVariable}
      colorScale={colorScale}
      drawMode={drawMode}
      isLoading={isLoading}
      isLocating={isLocating}
      error={error}
      locationError={resolvedLocationError}
      mapTarget={mapTarget}
      onDrawModeChange={handleDrawModeChange}
      onBboxChange={handleBboxChange}
      onPolygonChange={handlePolygonChange}
      isClimate={isClimate}
      selectedMonths={selectedMonths}
      periodLabel={periodLabel}
      profile={profile}
      isProfileLoading={isProfileLoading}
      onCitySelect={handleCitySelect}
      onLocate={handleLocate}
      onClearLocationError={clearLocationError}
    />
  );
}
