import { ENDPOINTS } from "@/constants";
import type { TWikidataCity, TWikidataEntitiesResult, TWikidataSearchResult } from "@/types";
import axios from "axios";

export const WikidataService = {
  async searchCity(query: string): Promise<TWikidataCity[]> {
    const searchRes = await axios.get<TWikidataSearchResult>(ENDPOINTS.WIKIDATA, {
      params: {
        action: "wbsearchentities",
        search: query,
        language: "en",
        type: "item",
        limit: 10,
        format: "json",
        origin: "*",
      },
    });

    const entityIds: string[] = searchRes.data.search.map((item) => item.id);

    if (entityIds.length === 0) return [];

    const entitiesRes = await axios.get<TWikidataEntitiesResult>(ENDPOINTS.WIKIDATA, {
      params: {
        action: "wbgetentities",
        ids: entityIds.join("|"),
        props: "labels|descriptions|claims",
        languages: "en",
        format: "json",
        origin: "*",
      },
    });

    const entities: TWikidataEntitiesResult["entities"] = entitiesRes.data.entities;
    const results: TWikidataCity[] = [];

    for (const id of entityIds) {
      const entity = entities[id];
      if (!entity) continue;

      const coords = entity.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
      if (!coords) continue;

      results.push({
        id,
        label: entity.labels?.en?.value ?? id,
        description: entity.descriptions?.en?.value ?? "",
        lat: coords.latitude,
        lng: coords.longitude,
      });
    }

    return results;
  },
};
