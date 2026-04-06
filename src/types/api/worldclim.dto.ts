export type TSparqlValue = {
  type: string;
  value: string;
};

export type TSparqlUriValue = {
  type: "uri";
  value: string;
};

export type TWorldClimCellBinding = {
  cell: TSparqlUriValue;
  grid: TSparqlUriValue;
};

export type TWorldClimCellResponseResults = {
  distinct: boolean;
  ordered: boolean;
  bindings: TWorldClimCellBinding[];
};

export type TWorldClimTemperatureBinding = {
  month: TSparqlValue;
  tmin: TSparqlValue;
  tmax: TSparqlValue;
};

export type TWorldClimTemperatureResponse = {
  head: { vars: string[] };
  results: TWorldClimTemperatureResponseResults;
};

export type TWorldClimTemperatureResponseResults = {
  distinct: boolean;
  ordered: boolean;
  bindings: TWorldClimTemperatureBinding[];
};

export interface TWorldClimCellResponse {
  results: {
    bindings: {
      cell: TSparqlUriValue;
      grid: TSparqlUriValue;
    }[];
  };
}

export interface TWorldClimPixelsResponse {
  results: {
    bindings: {
      pixel: TSparqlUriValue;
    }[];
  };
}

export interface TWorldClimPixelResource {
  iri: string;
  cell: string;
  raster: string;
  variable: string;
  valueMonth01: number;
  valueMonth02: number;
  valueMonth03: number;
  valueMonth04: number;
  valueMonth05: number;
  valueMonth06: number;
  valueMonth07: number;
  valueMonth08: number;
  valueMonth09: number;
  valueMonth10: number;
  valueMonth11: number;
  valueMonth12: number;
}
