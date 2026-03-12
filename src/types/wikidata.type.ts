export type TWikidataSearchResult = {
  search: { id: string }[];
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

export type TWikidataCity = {
  id: string;
  label: string;
  description: string;
  lat: number;
  lng: number;
};
