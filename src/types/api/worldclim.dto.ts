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

export type TWorldClimBoxBinding = {
  pixel: TSparqlUriValue;
  lat: TSparqlValue;
  lng: TSparqlValue;
  variable: TSparqlUriValue;
  valueMonth01: TSparqlValue;
  valueMonth02: TSparqlValue;
  valueMonth03: TSparqlValue;
  valueMonth04: TSparqlValue;
  valueMonth05: TSparqlValue;
  valueMonth06: TSparqlValue;
  valueMonth07: TSparqlValue;
  valueMonth08: TSparqlValue;
  valueMonth09: TSparqlValue;
  valueMonth10: TSparqlValue;
  valueMonth11: TSparqlValue;
  valueMonth12: TSparqlValue;
};

export type TWorldClimBoxResponse = {
  results: {
    bindings: TWorldClimBoxBinding[];
  };
};

export type TWorldClimAvgBoxBinding = {
  variable: TSparqlUriValue;
  valueMonth01: TSparqlValue;
  valueMonth02: TSparqlValue;
  valueMonth03: TSparqlValue;
  valueMonth04: TSparqlValue;
  valueMonth05: TSparqlValue;
  valueMonth06: TSparqlValue;
  valueMonth07: TSparqlValue;
  valueMonth08: TSparqlValue;
  valueMonth09: TSparqlValue;
  valueMonth10: TSparqlValue;
  valueMonth11: TSparqlValue;
  valueMonth12: TSparqlValue;
};

export type TWorldClimAvgBoxResponse = {
  results: {
    bindings: TWorldClimAvgBoxBinding[];
  };
};

export type TWorldClimPointValueBinding = {
  value: TSparqlValue;
  month: TSparqlValue;
  pixel: TSparqlUriValue;
  raster: TSparqlUriValue;
  var: TSparqlUriValue;
  cell: TSparqlUriValue;
  grid: TSparqlUriValue;
};

export type TWorldClimPointValueResponse = {
  results: {
    bindings: TWorldClimPointValueBinding[];
  };
};

export type TWorldClimCellResource = {
  iri: string;
  elevation?: number;
};
