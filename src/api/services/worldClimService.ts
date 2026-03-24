import { WORLDCLIM_BASE_URL } from "@/constants";
import env from "@/env";
import type {
  TWorldClimCellResponse,
  TWorldClimPixelResource,
  TWorldClimPixelsResponse,
} from "@/types/api/worldclim.dto";
import type { TCellSize, TMonthlyTemperature } from "@/types/domain/climate";
import axios from "axios";

const WORLDCLIM_VARIABLE_BASE = "http://climate.gsic.uva.es/data/Variable_";
const WORLDCLIM_GRID_BASE = "http://climate.gsic.uva.es/data/Grid_";

const authHeaders = () => ({
  Authorization: `Bearer ${env.WORLDCLIM_API_KEY}`,
});

export const WorldClimService = {
  async getCellsForPoint(lat: number, lng: number): Promise<TWorldClimCellResponse> {
    const { data } = await axios.get<TWorldClimCellResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: { id: "cellofpoint", lat, lng },
      headers: authHeaders(),
    });
    return data;
  },

  extractCellBySize(response: TWorldClimCellResponse, size: TCellSize): string | null {
    const binding = response.results.bindings.find((b) => b.grid.value.includes(`Grid_${size}`));
    return binding?.cell.value ?? null;
  },

  async getPixelIrisForPoint(
    lat: number,
    lng: number,
    gridSize: TCellSize,
    variables: string[],
  ): Promise<string[]> {
    const { data } = await axios.get<TWorldClimPixelsResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: {
        id: "pixelsofapoint",
        lat,
        lng,
        grid: `${WORLDCLIM_GRID_BASE}${gridSize}`,
        var: variables.map((v) => `${WORLDCLIM_VARIABLE_BASE}${v}`),
        isClimate: true,
      },
      headers: authHeaders(),
    });

    return data.results.bindings.map((b) => b.pixel.value);
  },

  async getPixelResource(pixelIri: string): Promise<TWorldClimPixelResource> {
    const { data } = await axios.get<TWorldClimPixelResource>(`${WORLDCLIM_BASE_URL}/resource`, {
      params: { id: "Pixel", iri: pixelIri },
      headers: authHeaders(),
    });
    return data;
  },

  async getMonthlyTemperatures(
    lat: number,
    lng: number,
    gridSize: TCellSize,
  ): Promise<TMonthlyTemperature[]> {
    const pixelIris = await this.getPixelIrisForPoint(lat, lng, gridSize, ["tmin", "tmax"]);

    const tminIri = pixelIris.find((iri) => iri.includes("_tmin_"));
    const tmaxIri = pixelIris.find((iri) => iri.includes("_tmax_"));

    if (!tminIri || !tmaxIri) {
      throw new Error(`No tmin/tmax pixels found for (${lat}, ${lng}) at ${gridSize}`);
    }

    const [tminData, tmaxData] = await Promise.all([
      this.getPixelResource(tminIri),
      this.getPixelResource(tmaxIri),
    ]);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return Array.from({ length: 12 }, (_, i) => {
      const monthKey =
        `valueMonth${String(i + 1).padStart(2, "0")}` as keyof TWorldClimPixelResource;
      return {
        month: i + 1,
        monthName: monthNames[i],
        tmin: Number(tminData[monthKey]),
        tmax: Number(tmaxData[monthKey]),
      };
    });
  },
};
