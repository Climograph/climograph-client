export type TMartonneBadge = {
  labelKey: string;
  bg: string;
  color: string;
};

export function getMartonneBadge(martonneIndex: number | null): TMartonneBadge | null {
  if (martonneIndex === null || isNaN(martonneIndex)) return null;
  if (martonneIndex < 5) return { labelKey: "chart.martonneClass.hyperarid", bg: "#f8d7da", color: "#842029" };
  if (martonneIndex < 10) return { labelKey: "chart.martonneClass.arid", bg: "#fde8d0", color: "#7d3c00" };
  if (martonneIndex < 20) return { labelKey: "chart.martonneClass.semiArid", bg: "#fff3cd", color: "#664d03" };
  if (martonneIndex < 30) return { labelKey: "chart.martonneClass.subHumid", bg: "#d1f0e0", color: "#0a4d2e" };
  if (martonneIndex <= 35) return { labelKey: "chart.martonneClass.humid", bg: "#cfe2ff", color: "#084298" };
  return { labelKey: "chart.martonneClass.perhumid", bg: "#e2d9f3", color: "#3d1a78" };
}
