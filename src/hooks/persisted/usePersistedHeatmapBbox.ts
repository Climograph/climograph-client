import { DEFAULT_HEATMAP_BBOX, LOCAL_STORAGE_KEYS } from "@/constants";
import { TBbox } from "@/types";
import { useState } from "react";

function loadBbox(): TBbox | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.HEATMAP_BBOX);
    if (raw === null) return DEFAULT_HEATMAP_BBOX;
    return JSON.parse(raw) as TBbox | null;
  } catch {
    return DEFAULT_HEATMAP_BBOX;
  }
}

function saveBbox(bbox: TBbox | null) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.HEATMAP_BBOX, JSON.stringify(bbox));
  } catch {
    // ignore write errors
  }
}

export function usePersistedHeatmapBbox() {
  const [bbox, setBbox] = useState<TBbox | null>(loadBbox);

  function selectBbox(newBbox: TBbox | null) {
    setBbox(newBbox);
    saveBbox(newBbox);
  }

  return { bbox, selectBbox };
}
