import { ENDPOINTS } from "@/constants/api.constant";
import type {
  WikidataCity,
  WikidataEntitiesResult,
  WikidataSearchResult,
} from "@/types/wikidata.type";
import axios from "axios";

export const WikidataService = {
  async searchCity(query: string): Promise<WikidataCity[]> {
    const searchRes = await axios.get<WikidataSearchResult>(ENDPOINTS.WIKIDATA, {
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

    const entitiesRes = await axios.get<WikidataEntitiesResult>(ENDPOINTS.WIKIDATA, {
      params: {
        action: "wbgetentities",
        ids: entityIds.join("|"),
        props: "labels|descriptions|claims",
        languages: "en",
        format: "json",
        origin: "*",
      },
    });

    const entities: WikidataEntitiesResult["entities"] = entitiesRes.data.entities;
    const results: WikidataCity[] = [];

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
