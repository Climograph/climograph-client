import { ENDPOINTS } from "@/constants";
import type {
  TWikidataCity,
  TWikidataEntitiesResult,
  TWikidataGeoSearchResult,
  TWikidataSearchResult,
} from "@/types";
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

  async findNearestCityByCoordinates(lat: number, lng: number): Promise<TWikidataCity | null> {
    const geoSearchRes = await axios.get<TWikidataGeoSearchResult>(ENDPOINTS.WIKIDATA, {
      params: {
        action: "query",
        list: "geosearch",
        gscoord: `${lat}|${lng}`,
        gsradius: 10000,
        gslimit: 10,
        format: "json",
        origin: "*",
      },
    });

    const geosearch = geoSearchRes.data.query?.geosearch;
    if (!Array.isArray(geosearch) || geosearch.length === 0) {
      return null;
    }

    const entityIds: string[] = [];
    for (const item of geosearch) {
      if (!item || typeof item.title !== "string") {
        continue;
      }

      if (/^Q\d+$/.test(item.title)) {
        entityIds.push(item.title);
      }
    }

    if (entityIds.length === 0) {
      return null;
    }

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

    const entities = entitiesRes.data.entities;

    for (const id of entityIds) {
      const entity = entities[id];
      if (!entity) continue;

      const coords = entity.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
      if (!coords) continue;

      return {
        id,
        label: entity.labels?.en?.value ?? id,
        description: entity.descriptions?.en?.value ?? "",
        lat: coords.latitude,
        lng: coords.longitude,
      };
    }

    return null;
  },
};
