import { WORLDCLIM_BASE_URL } from "@/constants/api.constant";
import { MONTH_NAMES } from "@/constants/climate.constant";
import env from "@/env";
import type {
  CellSize,
  MonthlyTemperature,
  WorldClimCellResponse,
  WorldClimTemperatureBinding,
  WorldClimTemperatureResponse,
} from "@/types/climate.type";
import axios from "axios";

export const WorldClimService = {
  async getCellsForPoint(lat: number, lng: number): Promise<WorldClimCellResponse> {
    const res = await axios.get<WorldClimCellResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: { id: "cellofpoint", lat, lng },
      headers: { Authorization: `Bearer ${env.WORLDCLIM_API_KEY}` },
    });

    return res.data;
  },

  extractCellBySize(response: WorldClimCellResponse, size: CellSize): string | null {
    const sizeKey = `Grid_${size}`;
    const binding = response.results.bindings.find((b) => b.grid.value.includes(sizeKey));

    if (!binding) return null;

    return binding.cell.value;
  },

  async getTemperatureForCell(cellId: string): Promise<MonthlyTemperature[]> {
    const res = await axios.get<WorldClimTemperatureResponse>(`${WORLDCLIM_BASE_URL}/query`, {
      params: { id: "climate", cell: cellId },
      headers: { Authorization: `Bearer ${env.WORLDCLIM_API_KEY}` },
    });

    const bindings: WorldClimTemperatureBinding[] = res.data.results.bindings;

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
