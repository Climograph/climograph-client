import type { TWikidataCity } from "@/types";

export type TLocationSearchProps = {
  isLocating: boolean;
  locationError: string | null;
  defaultValue?: string;
  onCitySelect: (city: TWikidataCity) => void;
  onLocate: () => void;
  onClearLocationError: () => void;
};
