import { ENDPOINTS } from "@/constants";
import type {
  TWikidataCity,
  TWikidataGeoSearchResult,
  TWikidataSearchResult,
  TWikidataSparqlResult,
} from "@/types";
import { isValidString, parseWktPoint } from "@/utils";
import axios from "axios";

export const WikidataService = {
  async searchCity(query: string, lang = "en"): Promise<TWikidataCity[]> {
    const searchRes = await axios.get<TWikidataSearchResult>(ENDPOINTS.WIKIDATA, {
      params: {
        action: "wbsearchentities",
        search: query,
        language: lang,
        uselang: lang,
        type: "item",
        limit: 50,
        format: "json",
        origin: "*",
      },
    });

    const items = searchRes.data.search;
    if (items.length === 0) return [];

    const ids = items.map((item) => item.id);
    const values = ids.map((id) => `wd:${id}`).join(" ");

    const sparqlQuery = `
      SELECT ?settlement ?point ?sitelinks ?statements WHERE {
        VALUES ?settlement { ${values} }
        ?settlement wdt:P31/wdt:P279* wd:Q486972 .
        ?settlement wdt:P625 ?point .
        ?settlement wikibase:sitelinks ?sitelinks .
        ?settlement wikibase:statements ?statements .
      }
      ORDER BY DESC(?sitelinks) DESC(?statements)
    `;

    const sparqlRes = await axios.get<TWikidataSparqlResult>(ENDPOINTS.WIKIDATA_SPARQL as string, {
      params: { query: sparqlQuery, format: "json" },
      headers: { Accept: "application/sparql-results+json" },
    });

    const sparqlData = sparqlRes.data as Record<string, unknown>;
    // @ts-expect-error - accessing nested property on response
    const bindings = (sparqlData?.results?.bindings ?? []) as unknown[];
    if (!Array.isArray(bindings) || bindings.length === 0) {
      return [];
    }
    const seen = new Set<string>();
    const results: TWikidataCity[] = [];

    for (const binding of bindings) {
      const binding_ = binding as Record<string, unknown>;
      const settlement = binding_?.["settlement"] as Record<string, unknown> | undefined;
      if (!settlement || !isValidString(settlement["value"])) continue;

      const iri = settlement["value"];
      const id = iri.split("/").pop() ?? iri;
      if (seen.has(id)) continue;
      seen.add(id);

      const point = binding_?.["point"] as Record<string, unknown> | undefined;
      if (!point || !isValidString(point["value"])) continue;

      const coords = parseWktPoint(point["value"]);
      if (!coords) continue;

      const searchItem = items.find((item) => item.id === id);
      results.push({
        id,
        label: (searchItem?.label ?? id) as string,
        description: (searchItem?.description ?? "") as string,
        lat: coords.lat,
        lng: coords.lng,
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

    const values = entityIds.map((id) => `wd:${id}`).join(" ");

    const sparqlQuery = `
      SELECT ?settlement ?point ?sitelinks ?statements WHERE {
        VALUES ?settlement { ${values} }
        ?settlement wdt:P31/wdt:P279* wd:Q486972 .
        ?settlement wdt:P625 ?point .
        ?settlement wikibase:sitelinks ?sitelinks .
        ?settlement wikibase:statements ?statements .
      }
      ORDER BY DESC(?sitelinks) DESC(?statements)
      LIMIT 1
    `;

    const sparqlRes = await axios.get<TWikidataSparqlResult>(ENDPOINTS.WIKIDATA_SPARQL as string, {
      params: { query: sparqlQuery, format: "json" },
      headers: { Accept: "application/sparql-results+json" },
    });

    const sparqlData = sparqlRes.data as Record<string, unknown>;
    // @ts-expect-error - accessing nested property on response
    const bindings = (sparqlData?.results?.bindings ?? []) as unknown[];
    if (!Array.isArray(bindings) || bindings.length === 0) {
      return null;
    }

    const binding = bindings[0] as Record<string, unknown> | undefined;
    if (!binding) return null;

    const settlement = binding?.["settlement"] as Record<string, unknown> | undefined;
    if (!settlement || !isValidString(settlement["value"])) return null;

    const iri = settlement["value"];
    const id = iri.split("/").pop() ?? iri;
    const point = binding?.["point"] as Record<string, unknown> | undefined;
    if (!point || !isValidString(point["value"])) return null;

    const coords = parseWktPoint(point["value"]);
    if (!coords) return null;

    return {
      id: id,
      label: id,
      description: "",
      lat: coords.lat,
      lng: coords.lng,
    };
  },
};
