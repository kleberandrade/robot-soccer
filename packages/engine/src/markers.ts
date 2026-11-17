export const TEAM_COLORS = { blue: "#1515a6", yellow: "#f2df00" };
const ID_COLORS = [
  ["#df2027", "#00bd36"],
  ["#df2027", "#00bccc"],
  ["#00bd36", "#df2027"],
] as const;
export function markersFor(id: string) {
  const [team, index] = id.split("-"),
    colors = ID_COLORS[Number(index)];
  if (!colors) throw new Error("Unknown robot marker ID");
  const color = team === "blue" ? TEAM_COLORS.blue : TEAM_COLORS.yellow;
  return [
    { x: 0.0175, y: 0, width: 0.03, height: 0.065, color },
    { x: -0.0175, y: 0.0175, width: 0.03, height: 0.03, color: colors[0] },
    { x: -0.0175, y: -0.0175, width: 0.03, height: 0.03, color: colors[1] },
  ];
}
