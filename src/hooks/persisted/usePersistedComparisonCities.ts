import { DEFAULT_COMPARE_CITY_A, DEFAULT_COMPARE_CITY_B, LOCAL_STORAGE_KEYS } from "@/constants";
import type { TWikidataCity } from "@/types";
import { useState } from "react";

function loadCity(key: string, fallback: TWikidataCity): TWikidataCity {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as TWikidataCity) : fallback;
  } catch {
    return fallback;
  }
}

function saveCity(key: string, city: TWikidataCity) {
  try {
    localStorage.setItem(key, JSON.stringify(city));
  } catch {
    return;
  }
}

export function usePersistedComparisonCities() {
  const [cityA, setCityA] = useState<TWikidataCity>(() =>
    loadCity(LOCAL_STORAGE_KEYS.COMPARE_CITY_A, DEFAULT_COMPARE_CITY_A),
  );
  const [cityB, setCityB] = useState<TWikidataCity>(() =>
    loadCity(LOCAL_STORAGE_KEYS.COMPARE_CITY_B, DEFAULT_COMPARE_CITY_B),
  );

  function selectCityA(city: TWikidataCity) {
    setCityA(city);
    saveCity(LOCAL_STORAGE_KEYS.COMPARE_CITY_A, city);
  }

  function selectCityB(city: TWikidataCity) {
    setCityB(city);
    saveCity(LOCAL_STORAGE_KEYS.COMPARE_CITY_B, city);
  }

  return { cityA, cityB, selectCityA, selectCityB };
}
