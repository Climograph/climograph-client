import { ENDPOINTS } from "@/constants";
import i18n from "i18next";
import type {
  TWikidataCity,
  TWikidataEntitiesResult,
  TWikidataGeoSearchResult,
  TWikidataSearchResult,
  TWikidataSparqlResult,
} from "@/types";
import { isValidString, parseWktPoint } from "@/utils";
import axios from "axios";

export const WikidataService = {
  async searchCity(query: string): Promise<TWikidataCity[]> {
    const lang = i18n.language ?? "en";

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
    `;

    const sparqlRes = await axios.get<TWikidataSparqlResult>(ENDPOINTS.WIKIDATA_SPARQL as string, {
      params: { query: sparqlQuery, format: "json" },
      headers: { Accept: "application/sparql-results+json" },
    });

    const bindings = sparqlRes.data.results.bindings;
    if (bindings.length === 0) return [];

    const sortedBindings = [...bindings].sort((a, b) => {
      const scoreA = 3 * Number(a.sitelinks.value) + Number(a.statements.value);
      const scoreB = 3 * Number(b.sitelinks.value) + Number(b.statements.value);
      return scoreB - scoreA;
    });

    const seen = new Set<string>();
    const results: TWikidataCity[] = [];

    for (const binding of sortedBindings) {
      if (!isValidString(binding.settlement.value)) continue;

      const id = binding.settlement.value.split("/").pop() ?? binding.settlement.value;
      if (seen.has(id)) continue;
      seen.add(id);

      if (!isValidString(binding.point.value)) continue;

      const coords = parseWktPoint(binding.point.value);
      if (!coords) continue;

      const searchItem = items.find((item) => item.id === id);
      results.push({
        id,
        label: String(searchItem?.label ?? id),
        description: String(searchItem?.description ?? ""),
        lat: coords.lat,
        lng: coords.lng,
      });
    }

    return results;
  },

  async findNearestCityByCoordinates(lat: number, lng: number): Promise<TWikidataCity | null> {
    const lang = i18n.language ?? "en";

    const geoSearchRes = await axios.get<TWikidataGeoSearchResult>(ENDPOINTS.WIKIDATA, {
      params: {
        action: "query",
        list: "geosearch",
        gscoord: `${lat}|${lng}`,
        gsradius: 10000,
        gslimit: 5,
        format: "json",
        origin: "*",
      },
    });

    const geosearch = geoSearchRes.data.query?.geosearch;
    if (!Array.isArray(geosearch) || geosearch.length === 0) {
      return null;
    }

    const geoItems = geosearch.filter(
      (item) => item && typeof item.title === "string" && /^Q\d+$/.test(item.title),
    );

    if (geoItems.length === 0) return null;

    const ids = geoItems.map((item) => item.title).join("|");

    const entitiesRes = await axios.get<TWikidataEntitiesResult>(ENDPOINTS.WIKIDATA, {
      params: {
        action: "wbgetentities",
        ids,
        props: "labels|descriptions",
        languages: `${lang}|en`,
        format: "json",
        origin: "*",
      },
    });

    const entities = entitiesRes.data.entities;

    for (const geoItem of geoItems) {
      const id = geoItem.title;
      const entity = entities[id];
      if (!entity) continue;

      const label = entity.labels?.[lang]?.value ?? entity.labels?.["en"]?.value ?? "";
      const description =
        entity.descriptions?.[lang]?.value ?? entity.descriptions?.["en"]?.value ?? "";

      return {
        id,
        label: label || id,
        description,
        lat: geoItem.lat,
        lng: geoItem.lon,
      };
    }

    return null;
  },
};
