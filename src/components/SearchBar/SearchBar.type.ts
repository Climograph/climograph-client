import type { TWikidataCity } from "@/types/domain/location";

export type TSearchBarProps = {
  onCitySelect: (city: TWikidataCity) => void;
};
