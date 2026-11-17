import type { Config } from "./model";
import { fieldOutline, goalAreaOutline, type Point } from "./geometry";
function closed(points: Point[]) {
  return [...points, points[0]];
}
export function fieldLines(c: Config): Point[][] {
  const lines: Point[][] = [
    closed(fieldOutline(c)),
    [
      { x: 0, y: -c.width / 2 },
      { x: 0, y: c.width / 2 },
    ],
    Array.from({ length: 65 }, (_, i) => ({
      x: c.centerRadius * Math.cos((i * Math.PI) / 32),
      y: c.centerRadius * Math.sin((i * Math.PI) / 32),
    })),
  ];
  for (const side of [-1, 1]) {
    lines.push(closed(goalAreaOutline(side, c)));
    for (const sy of [-1, 0, 1]) {
      const x = (side * c.length) / 4,
        y = sy * (c.width / 2 - 0.25);
      lines.push(
        [
          { x: x - 0.025, y },
          { x: x + 0.025, y },
        ],
        [
          { x, y: y - 0.025 },
          { x, y: y + 0.025 },
        ],
      );
    }
  }
  return lines;
}
export function markerCorners(
  r: { x: number; y: number; angle: number },
  patch: { x: number; y: number; width: number; height: number },
): Point[] {
  const cos = Math.cos(r.angle),
    sin = Math.sin(r.angle);
  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([x, y]) => {
    const a = patch.x + (x * patch.width) / 2,
      b = patch.y + (y * patch.height) / 2;
    return { x: r.x + a * cos - b * sin, y: r.y + a * sin + b * cos };
  });
}
