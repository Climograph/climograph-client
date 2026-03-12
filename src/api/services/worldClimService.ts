import { WORLDCLIM_BASE_URL } from "@/constants/api.constant";
import { MONTH_NAMES } from "@/constants/climate.constant";
import env from "@/env";
import type {
  TCellSize,
  TMonthlyTemperature,
  TWorldClimCellResponse,
  TWorldClimTemperatureBinding,
  TWorldClimTemperatureResponse,
} from "@/types/climate.type";
import axios from "axios";

export const WorldClimService = {
  async getCellsForPoint(lat: number, lng: number): Promise<TWorldClimCellResponse> {
    const res = await axios.get<TWorldClimCellResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: { id: "cellofpoint", lat, lng },
      headers: { Authorization: `Bearer ${env.WORLDCLIM_API_KEY}` },
    });

    return res.data;
  },

  extractCellBySize(response: TWorldClimCellResponse, size: TCellSize): string | null {
    const sizeKey = `Grid_${size}`;
    const binding = response.results.bindings.find((b) => b.grid.value.includes(sizeKey));

    if (!binding) return null;

    return binding.cell.value;
  },

  async getTemperatureForCell(cellId: string): Promise<TMonthlyTemperature[]> {
    const res = await axios.get<TWorldClimTemperatureResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: { id: "climate", cell: cellId },
      headers: { Authorization: `Bearer ${env.WORLDCLIM_API_KEY}` },
    });

    const bindings: TWorldClimTemperatureBinding[] = res.data.results.bindings;

    return bindings
      .map((b) => {
        const monthStr = b.month.value.split("/").pop() ?? "";
        const monthNum = parseInt(monthStr.replace(/\D/g, ""), 10);
        return {
          month: monthNum,
          monthName: MONTH_NAMES[monthNum - 1] ?? monthStr,
          tmin: parseFloat(b.tmin.value),
          tmax: parseFloat(b.tmax.value),
        };
      })
      .sort((a, b) => a.month - b.month);
  },
};
