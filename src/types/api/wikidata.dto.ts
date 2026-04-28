export type TWikidataSearchItem = {
  id: string;
  concepturi: string;
  label?: string;
  description?: string;
};

export type TWikidataSearchResult = {
  search: TWikidataSearchItem[];
};

export type TWikidataGeoSearchItem = {
  title: string;
};

export type TWikidataGeoSearchResult = {
  query?: {
    geosearch?: TWikidataGeoSearchItem[];
  };
};

export type TWikidataEntityValue = {
  value: string;
};

export type TWikidataCoords = {
  latitude: number;
  longitude: number;
};

export type TWikidataEntity = {
  labels?: { en?: TWikidataEntityValue };
  descriptions?: { en?: TWikidataEntityValue };
  claims?: {
    P625?: { mainsnak?: { datavalue?: { value?: TWikidataCoords } } }[];
  };
};

export type TWikidataEntitiesResult = {
  entities: Record<string, TWikidataEntity>;
};

export type TWikidataSparqlBinding = {
  settlement: { value: string };
  point: { value: string };
  sitelinks: { value: string };
  statements: { value: string };
};

export type TWikidataSparqlResult = {
  results: {
    bindings: TWikidataSparqlBinding[];
  };
};
