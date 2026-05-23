import { LOCAL_STORAGE_KEYS } from "@/constants";
import { useState } from "react";

function defaultPeriods(): number[] {
  const currentYear = new Date().getFullYear();
  return [currentYear - 1, currentYear];
}

function loadPeriods(): number[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.COMPARE_PERIODS);
    if (!raw) return defaultPeriods();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultPeriods();
    const years = parsed.filter((v): v is number => typeof v === "number");
    return years.length >= 2 ? years : defaultPeriods();
  } catch {
    return defaultPeriods();
  }
}

function savePeriods(years: number[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COMPARE_PERIODS, JSON.stringify(years));
  } catch {
    return;
  }
}

export function usePersistedPeriods() {
  const [periods, _setPeriods] = useState<number[]>(loadPeriods);

  function setPeriods(years: number[]) {
    _setPeriods(years);
    savePeriods(years);
  }

  return [periods, setPeriods] as const;
}
