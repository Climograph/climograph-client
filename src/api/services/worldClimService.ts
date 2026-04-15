import { WORLDCLIM_BASE_URL, WORLDCLIM_GRID_BASE, WORLDCLIM_VARIABLE_BASE } from "@/constants";
import env from "@/env";
import type {
  TWorldClimCellResponse,
  TWorldClimPixelResource,
  TWorldClimPixelsResponse,
} from "@/types";
import type { TCellSize } from "@/types/domain/climate";
import axios from "axios";

const authHeaders = () => ({
  Authorization: `Bearer ${env.WORLDCLIM_API_KEY}`,
});

export const WorldClimService = {
  async getCellsForPoint(lat: number, lng: number) {
    const response = await axios.get<TWorldClimCellResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: { id: "cellofpoint", lat, lng },
      headers: authHeaders(),
    });

    return response.data;
  },

  async getPixelsForPoint(
    lat: number,
    lng: number,
    gridSize: TCellSize,
    variables: string[],
    isClimate: boolean,
    year?: number,
  ) {
    const response = await axios.get<TWorldClimPixelsResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: {
        id: "pixelsofapoint",
        lat,
        lng,
        grid: `${WORLDCLIM_GRID_BASE}${gridSize}`,
        var: variables.map((v) => `${WORLDCLIM_VARIABLE_BASE}${v}`),
        ...(isClimate ? { isClimate: true } : { isWeather: true, year }),
      },
      headers: authHeaders(),
    });

    return response.data;
  },

  async getPixelResource(pixelIri: string) {
    const response = await axios.get<TWorldClimPixelResource>(`${WORLDCLIM_BASE_URL}/resource`, {
      params: { id: "Pixel", iri: pixelIri },
      headers: authHeaders(),
    });

    return response.data;
  },
};
