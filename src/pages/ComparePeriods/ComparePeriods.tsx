import {
  CLIMATE_PERIOD_LABELS,
  CLIMATE_PERIODS,
  DATASETS,
  SIDEBAR_PARAMS,
  VARIABLE_LABELS,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
} from "@/constants";
import {
  useGeolocation,
  useGetAltitude,
  useGetComparePeriods,
  usePersistedComparisonCities,
} from "@/hooks";
import { useFiltersStore } from "@/stores";
import type { TClimatePeriod, TWikidataCity } from "@/types";
import {
  encodeMonths,
  encodeVars,
  parseCellSize,
  parseCoord,
  parseDataset,
  parsePeriod,
  parseVars,
  parseYear,
} from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { ComparePeriodsView } from "./ComparePeriodsView";

function resolvePeriodFromUrl(raw: string | null, fallback: TClimatePeriod): TClimatePeriod {
  return parsePeriod(raw) ?? fallback;
}

function resolveYearFromUrl(raw: string | null, fallback: number): number {
  return parseYear(raw) ?? fallback;
}

export function ComparePeriods() {
  const { t } = useTranslation();
  const { cityA, selectCityA } = usePersistedComparisonCities();
  const { gridSize, dataset, months, variables } = useFiltersStore();
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();
  const selectedMonths = Array.isArray(months) ? months : null;
  const [searchParams, setSearchParams] = useSearchParams();

  // Lazy initial values from URL (read once at mount)
  const [climatePeriodA, setClimatePeriodA] = useState<TClimatePeriod>(() =>
    resolvePeriodFromUrl(searchParams.get(SIDEBAR_PARAMS.PERIOD_A), CLIMATE_PERIODS.C1970_2000),
  );
  const [climatePeriodB, setClimatePeriodB] = useState<TClimatePeriod>(() =>
    resolvePeriodFromUrl(searchParams.get(SIDEBAR_PARAMS.PERIOD_B), CLIMATE_PERIODS.C1991_2020),
  );
  const [yearA, setYearA] = useState<number>(() =>
    resolveYearFromUrl(searchParams.get(SIDEBAR_PARAMS.YEAR_A), WEATHER_MIN_YEAR),
  );
  const [yearB, setYearB] = useState<number>(() =>
    resolveYearFromUrl(searchParams.get(SIDEBAR_PARAMS.YEAR_B), WEATHER_MAX_YEAR),
  );

  // Restore city and global filters from URL once on mount
  useEffect(() => {
    const lat = parseCoord(searchParams.get(SIDEBAR_PARAMS.LAT));
    const lng = parseCoord(searchParams.get(SIDEBAR_PARAMS.LNG));
    const cityLabel = searchParams.get(SIDEBAR_PARAMS.CITY);

    if (lat !== null && lng !== null) {
      const urlCity: TWikidataCity = {
        id: `url:${lat},${lng}`,
        label: cityLabel ?? `${lat}, ${lng}`,
        description: "",
        lat,
        lng,
      };
      selectCityA(urlCity);
    }

    const store = useFiltersStore.getState();

    const ds = parseDataset(searchParams.get(SIDEBAR_PARAMS.DATASET));
    if (ds !== null) store.actions.setDataset(ds);

    const vars = parseVars(searchParams.get(SIDEBAR_PARAMS.VAR));
    if (vars !== null) store.actions.setVariables(vars);

    const grid = parseCellSize(searchParams.get(SIDEBAR_PARAMS.GRID));
    if (grid !== null) store.actions.setGridSize(grid);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync all shareable state → URL (replace)
  const varsStr = useMemo(() => encodeVars(variables), [variables]);
  const monthsStr = useMemo(() => encodeMonths(months), [months]);

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

    maybeSet(SIDEBAR_PARAMS.CITY, cityA.label.trim());
    maybeSet(SIDEBAR_PARAMS.LAT, cityA.lat.toFixed(4));
    maybeSet(SIDEBAR_PARAMS.LNG, cityA.lng.toFixed(4));
    maybeSet(SIDEBAR_PARAMS.DATASET, dataset);
    maybeSet(SIDEBAR_PARAMS.VAR, varsStr);
    maybeSet(SIDEBAR_PARAMS.GRID, gridSize);
    maybeSet(SIDEBAR_PARAMS.MONTHS, monthsStr);

    if (dataset === DATASETS.CLIMATE) {
      maybeSet(SIDEBAR_PARAMS.PERIOD_A, climatePeriodA);
      maybeSet(SIDEBAR_PARAMS.PERIOD_B, climatePeriodB);
      maybeDelete(SIDEBAR_PARAMS.YEAR_A);
      maybeDelete(SIDEBAR_PARAMS.YEAR_B);
    } else {
      maybeSet(SIDEBAR_PARAMS.YEAR_A, String(yearA));
      maybeSet(SIDEBAR_PARAMS.YEAR_B, String(yearB));
      maybeDelete(SIDEBAR_PARAMS.PERIOD_A);
      maybeDelete(SIDEBAR_PARAMS.PERIOD_B);
    }

    if (changed) setSearchParams(nextParams, { replace: true });
  }, [
    cityA.label,
    cityA.lat,
    cityA.lng,
    dataset,
    climatePeriodA,
    climatePeriodB,
    yearA,
    yearB,
    varsStr,
    gridSize,
    monthsStr,
    searchParams,
    setSearchParams,
  ]);

  // Document title
  useEffect(() => {
    const cityLabel = cityA.label;
    const validCity = cityLabel && !cityLabel.startsWith("url:") && !/^Q\d+$/.test(cityLabel);
    if (!validCity) {
      document.title = "Compare Periods | Climatica";
      return;
    }
    const varLabel = variables[0] ? (VARIABLE_LABELS[variables[0]] ?? variables[0]) : "";
    if (dataset === DATASETS.CLIMATE) {
      const labelA = CLIMATE_PERIOD_LABELS[climatePeriodA] ?? climatePeriodA;
      const labelB = CLIMATE_PERIOD_LABELS[climatePeriodB] ?? climatePeriodB;
      document.title = `${cityLabel} · ${varLabel} ${labelA} vs ${labelB} | Climatica`;
    } else {
      document.title = `${cityLabel} · ${varLabel} ${yearA} vs ${yearB} | Climatica`;
    }
  }, [cityA.label, dataset, climatePeriodA, climatePeriodB, yearA, yearB, variables]);

  const { dataA, dataB, isLoading, error } = useGetComparePeriods(
    cityA.lat,
    cityA.lng,
    climatePeriodA,
    climatePeriodB,
    yearA,
    yearB,
    gridSize,
    dataset,
  );

  const { data: altitude = null } = useGetAltitude(cityA.lat, cityA.lng, gridSize);

  function handleLocate() {
    locate(selectCityA);
  }

  function handleCitySelect(city: TWikidataCity) {
    selectCityA(city);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(SIDEBAR_PARAMS.CITY, city.label.trim());
    nextParams.set(SIDEBAR_PARAMS.LAT, city.lat.toFixed(4));
    nextParams.set(SIDEBAR_PARAMS.LNG, city.lng.toFixed(4));
    setSearchParams(nextParams, { replace: false });
  }

  const resolvedLocationError = locationError !== null ? t(locationError) : null;

  return (
    <ComparePeriodsView
      city={cityA}
      altitude={altitude}
      dataset={dataset}
      climatePeriodA={climatePeriodA}
      climatePeriodB={climatePeriodB}
      yearA={yearA}
      yearB={yearB}
      dataA={dataA}
      dataB={dataB}
      autoGrid={gridSize}
      selectedMonths={selectedMonths}
      isLoading={isLoading}
      isLocating={isLocating}
      error={error}
      locationError={resolvedLocationError}
      onCitySelect={handleCitySelect}
      onLocate={handleLocate}
      onClearLocationError={clearLocationError}
      onClimatePeriodAChange={setClimatePeriodA}
      onClimatePeriodBChange={setClimatePeriodB}
      onYearAChange={setYearA}
      onYearBChange={setYearB}
    />
  );
}
