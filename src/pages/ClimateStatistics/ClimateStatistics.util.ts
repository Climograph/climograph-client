export function toCityQueryParam(cityLabel: string) {
  return cityLabel.trim().toLowerCase();
}

export function formatCoordinate(value: number) {
  return value.toFixed(4);
}
