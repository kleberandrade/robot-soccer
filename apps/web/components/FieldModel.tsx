import { useMemo } from "react";
import { Shape } from "three";
import { type Config } from "@robot-soccer/engine";
import { fieldOutline, type Point } from "@robot-soccer/engine/geometry";
import { fieldLines } from "@robot-soccer/engine/field";
function MetricLine({
  a,
  b,
  color = "#dce2dc",
}: {
  a: Point;
  b: Point;
  color?: string;
}) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  return (
    <mesh
      position={[(a.x + b.x) / 2, 0.002, (a.y + b.y) / 2]}
      rotation={[0, -Math.atan2(dy, dx), 0]}
    >
      <boxGeometry args={[Math.hypot(dx, dy), 0.001, 0.003]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
function Wall({ a, b }: { a: Point; b: Point }) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    length = Math.hypot(dx, dy),
    sign = Math.sign(-dy * (a.x + b.x) + dx * (a.y + b.y)) || 1;
  return (
    <mesh
      position={[
        (a.x + b.x) / 2 - ((sign * dy) / length) * 0.0125,
        0.025,
        (a.y + b.y) / 2 + ((sign * dx) / length) * 0.0125,
      ]}
      rotation={[0, -Math.atan2(b.y - a.y, b.x - a.x), 0]}
    >
      <boxGeometry args={[Math.hypot(b.x - a.x, b.y - a.y), 0.05, 0.025]} />
      <meshStandardMaterial color="#090e12" roughness={0.9} />
    </mesh>
  );
}
function FieldWalls({ config: c }: { config: Config }) {
  const x = c.length / 2,
    y = c.width / 2,
    k = c.cornerChamfer,
    g = c.goalWidth / 2;
  const borders: [Point, Point][] = [
    [
      { x: -x + k, y: -y },
      { x: x - k, y: -y },
    ],
    [
      { x: -x + k, y },
      { x: x - k, y },
    ],
  ];
  for (const sign of [-1, 1]) {
    borders.push(
      [
        { x: sign * x, y: -y + k },
        { x: sign * x, y: -g },
      ],
      [
        { x: sign * x, y: g },
        { x: sign * x, y: y - k },
      ],
    );
    borders.push(
      [
        { x: sign * (x - k), y: -y },
        { x: sign * x, y: -y + k },
      ],
      [
        { x: sign * (x - k), y },
        { x: sign * x, y: y - k },
      ],
    );
    borders.push(
      [
        { x: sign * x, y: g },
        { x: sign * (x + c.goalDepth), y: g },
      ],
      [
        { x: sign * x, y: -g },
        { x: sign * (x + c.goalDepth), y: -g },
      ],
      [
        { x: sign * (x + c.goalDepth), y: -g },
        { x: sign * (x + c.goalDepth), y: g },
      ],
    );
  }
  return (
    <>
      {borders
        .filter(([a, b]) => Math.hypot(a.x - b.x, a.y - b.y) > 1e-8)
        .map(([a, b], i) => (
          <Wall key={i} a={a} b={b} />
        ))}
    </>
  );
}
export default function FieldModel({ config: c }: { config: Config }) {
  const shape = useMemo(() => {
    const points = fieldOutline(c),
      s = new Shape();
    s.moveTo(points[0].x, -points[0].y);
    for (const p of points.slice(1)) s.lineTo(p.x, -p.y);
    s.closePath();
    return s;
  }, [c.length, c.width, c.cornerChamfer]);
  const lines = useMemo(() => fieldLines(c), [c]);
  return (
    <>
      <mesh position={[0, -0.035, 0]}>
        <boxGeometry
          args={[c.length + 2 * c.goalDepth + 0.1, 0.06, c.width + 0.1]}
        />
        <meshStandardMaterial color="#1b2b32" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#111619" roughness={1} />
      </mesh>
      {[-1, 1].map((sign) => (
        <mesh
          key={sign}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[sign * (c.length / 2 + c.goalDepth / 2), 0, 0]}
        >
          <planeGeometry args={[c.goalDepth, c.goalWidth]} />
          <meshStandardMaterial color="#080c0f" />
        </mesh>
      ))}
      {lines.flatMap((points, i) =>
        points
          .slice(1)
          .map((p, j) => <MetricLine key={`${i}-${j}`} a={points[j]} b={p} />),
      )}
      <FieldWalls config={c} />
    </>
  );
}
