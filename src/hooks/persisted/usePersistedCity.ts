import { DEFAULT_CITY, LOCAL_STORAGE_KEYS } from "@/constants";
import { TWikidataCity } from "@/types";
import { useState } from "react";

function loadCity(): TWikidataCity {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SELECTED_CITY);
    return raw ? (JSON.parse(raw) as TWikidataCity) : DEFAULT_CITY;
  } catch {
    return DEFAULT_CITY;
  }
}

function saveCity(city: TWikidataCity) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_SELECTED_CITY, JSON.stringify(city));
  } catch {
    // ? Ignore write errors
  }
}

export function usePersistedCity() {
  const [city, setCity] = useState<TWikidataCity>(loadCity);

  function selectCity(newCity: TWikidataCity) {
    setCity(newCity);
    saveCity(newCity);
  }

  return { city, selectCity };
}
