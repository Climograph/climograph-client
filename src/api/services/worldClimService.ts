import type { TClimatePeriod } from "@/constants";
import { WORLDCLIM_BASE_URL } from "@/constants";
import type {
  TCellSize,
  TRawAvgValueResponse,
  TRawPixelValueResponse,
  TVariable,
  TWorldClimCellResource,
  TWorldClimCellResponse,
  TWorldClimPixelResource,
  TWorldClimPointValueResponse,
} from "@/types";
import {
  buildDatasetParams,
  buildGridIri,
  buildVariableIris,
  createWorldClimAuthHeaders,
  extractCellBySize,
  validateResponseData,
} from "@/utils";
import axios from "axios";

export const WorldClimService = {
  async getCellsForPoint(lat: number, lng: number) {
    const response = await axios.get<TWorldClimCellResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: { id: "cellofpoint", lat, lng },
      headers: createWorldClimAuthHeaders(),
    });

    validateResponseData(response);
    return response.data;
  },

  async getCellForPoint(lat: number, lng: number, gridSize: TCellSize): Promise<string | null> {
    const response = await axios.get<TWorldClimCellResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: { id: "cellofpoint", lat, lng },
      headers: createWorldClimAuthHeaders(),
    });
    validateResponseData(response);
    return extractCellBySize(response.data, gridSize);
  },

  async getCellResource(cellIri: string): Promise<TWorldClimCellResource> {
    const response = await axios.get<TWorldClimCellResource>(`${WORLDCLIM_BASE_URL}/resource`, {
      params: { id: "Cell", iri: cellIri },
      headers: createWorldClimAuthHeaders(),
    });
    validateResponseData(response);
    return response.data;
  },

  async getClimateDataForPoint(
    lat: number,
    lng: number,
    gridSize: TCellSize,
    variables: readonly TVariable[],
    period: TClimatePeriod,
  ): Promise<TWorldClimPointValueResponse> {
    const response = await axios.get<TWorldClimPointValueResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: {
        id: "pixelvaluesofapoint",
        lat,
        lng,
        grid: buildGridIri(gridSize),
        var: buildVariableIris(variables),
        isClimate: true,
      },
      headers: createWorldClimAuthHeaders(),
    });
    validateResponseData(response);
    return {
      results: {
        bindings: response.data.results.bindings.filter((b) => b.raster.value.includes(period)),
      },
    };
  },

  async getWeatherDataForPoint(
    lat: number,
    lng: number,
    gridSize: TCellSize,
    variables: readonly TVariable[],
    year: number,
  ): Promise<TWorldClimPointValueResponse> {
    const response = await axios.get<TWorldClimPointValueResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: {
        id: "pixelvaluesofapoint",
        lat,
        lng,
        grid: buildGridIri(gridSize),
        var: buildVariableIris(variables),
        isWeather: true,
        year,
      },
      headers: createWorldClimAuthHeaders(),
    });
    validateResponseData(response);
    return response.data;
  },

  async getPixelResource(pixelIri: string) {
    const response = await axios.get<TWorldClimPixelResource>(`${WORLDCLIM_BASE_URL}/resource`, {
      params: { id: "Pixel", iri: pixelIri },
      headers: createWorldClimAuthHeaders(),
    });

    validateResponseData(response);
    return response.data;
  },

  async getPixelValuesInBox(
    north: number,
    south: number,
    west: number,
    east: number,
    gridSize: TCellSize,
    variables: string[],
    isClimate: boolean,
    year?: number,
  ): Promise<TRawPixelValueResponse> {
    const response = await axios.get<TRawPixelValueResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: {
        id: "pixelvaluesinbox",
        north,
        south,
        west,
        east,
        grid: buildGridIri(gridSize),
        var: buildVariableIris(variables),
        ...buildDatasetParams(isClimate, year),
      },
      headers: createWorldClimAuthHeaders(),
    });

    validateResponseData(response);
    return response.data;
  },

  async getAvgPixelValuesInBox(
    north: number,
    south: number,
    west: number,
    east: number,
    gridSize: TCellSize,
    variables: string[],
    isClimate: boolean,
    year?: number,
  ): Promise<TRawAvgValueResponse> {
    const response = await axios.get<TRawAvgValueResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: {
        id: "avgpixelvaluesinbox",
        north,
        south,
        west,
        east,
        grid: buildGridIri(gridSize),
        var: buildVariableIris(variables),
        ...buildDatasetParams(isClimate, year),
      },
      headers: createWorldClimAuthHeaders(),
    });

    validateResponseData(response);
    return response.data;
  },

  async getPixelValuesInPolygon(
    wkt: string,
    gridSize: TCellSize,
    variables: string[],
    isClimate: boolean,
    year?: number,
  ): Promise<TRawPixelValueResponse> {
    const response = await axios.get<TRawPixelValueResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: {
        id: "pixelvaluesinpolygonGEO",
        polygon: wkt,
        grid: buildGridIri(gridSize),
        var: buildVariableIris(variables),
        ...buildDatasetParams(isClimate, year),
      },
      headers: createWorldClimAuthHeaders(),
    });

    validateResponseData(response);
    return response.data;
  },

  async getAvgPixelValuesInPolygon(
    wkt: string,
    gridSize: TCellSize,
    variables: string[],
    isClimate: boolean,
    year?: number,
  ): Promise<TRawAvgValueResponse> {
    const response = await axios.get<TRawAvgValueResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: {
        id: "avgpixelvaluesinpolygonGEO",
        polygon: wkt,
        grid: buildGridIri(gridSize),
        var: buildVariableIris(variables),
        ...buildDatasetParams(isClimate, year),
      },
      headers: createWorldClimAuthHeaders(),
    });

    validateResponseData(response);
    return response.data;
  },
};
