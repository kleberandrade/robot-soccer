import {
  type Config,
  type Robot,
  type Match,
  type Team,
  direction,
  isActive,
  robotRadius,
  clamp,
} from "./model";
export type Point = { x: number; y: number };
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
export function robotCorners(r: Robot, c: Config): Point[] {
  const h = c.robotSide / 2,
    cos = Math.cos(r.angle),
    sin = Math.sin(r.angle);
  return [
    [h, h],
    [h, -h],
    [-h, -h],
    [-h, h],
  ].map(([x, y]) => ({
    x: r.x + x * cos - y * sin,
    y: r.y + x * sin + y * cos,
  }));
}
export function goalAreaContains(p: Point, side: number, c: Config) {
  const d = c.length / 2 - side * p.x,
    ay = Math.abs(p.y);
  if (d < 0) return false;
  if (d <= c.goalAreaDepth && ay <= c.goalAreaWidth / 2) return true;
  if (d < c.goalAreaDepth || d > c.goalAreaDepth + c.goalArcDepth) return false;
  return (
    ((d - c.goalAreaDepth) / c.goalArcDepth) ** 2 +
      (p.y / (c.goalArcWidth / 2)) ** 2 <=
    1
  );
}
export function goalAreaOutline(side: number, c: Config): Point[] {
  const l = c.length / 2,
    d = c.goalAreaDepth,
    w = c.goalAreaWidth / 2,
    a = c.goalArcWidth / 2;
  const arc = Array.from({ length: 25 }, (_, i) => ({
    x: l - d - c.goalArcDepth * Math.sin((i * Math.PI) / 24),
    y: a * Math.cos((i * Math.PI) / 24),
  }));
  return [
    { x: l, y: -w },
    { x: l, y: w },
    { x: l - d, y: w },
    ...arc,
    { x: l - d, y: -w },
  ].map((p) => ({ x: side * p.x, y: p.y }));
}
function cross(a: Point, b: Point, c: Point) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
function onSegment(a: Point, b: Point, p: Point) {
  return (
    p.x >= Math.min(a.x, b.x) - 1e-9 &&
    p.x <= Math.max(a.x, b.x) + 1e-9 &&
    p.y >= Math.min(a.y, b.y) - 1e-9 &&
    p.y <= Math.max(a.y, b.y) + 1e-9
  );
}
function segmentsIntersect(a: Point, b: Point, c: Point, d: Point) {
  const p = cross(a, b, c),
    q = cross(a, b, d),
    r = cross(c, d, a),
    s = cross(c, d, b);
  if (p * q < 0 && r * s < 0) return true;
  return [
    Math.abs(p) < 1e-9 && onSegment(a, b, c),
    Math.abs(q) < 1e-9 && onSegment(a, b, d),
    Math.abs(r) < 1e-9 && onSegment(c, d, a),
    Math.abs(s) < 1e-9 && onSegment(c, d, b),
  ].some(Boolean);
}
function pointInRobot(p: Point, r: Robot, c: Config) {
  const dx = p.x - r.x,
    dy = p.y - r.y,
    cos = Math.cos(r.angle),
    sin = Math.sin(r.angle);
  return (
    Math.abs(dx * cos + dy * sin) <= c.robotSide / 2 + 1e-9 &&
    Math.abs(-dx * sin + dy * cos) <= c.robotSide / 2 + 1e-9
  );
}
function crossesHalfEllipse(a: Point, b: Point, side: number, c: Config) {
  const center = c.length / 2 - c.goalAreaDepth;
  let p = {
      x: (center - side * a.x) / c.goalArcDepth,
      y: a.y / (c.goalArcWidth / 2),
    },
    q = {
      x: (center - side * b.x) / c.goalArcDepth,
      y: b.y / (c.goalArcWidth / 2),
    };
  if (p.x < 0 && q.x < 0) return false;
  if (p.x < 0) {
    const t = -p.x / (q.x - p.x);
    p = { x: 0, y: p.y + t * (q.y - p.y) };
  }
  if (q.x < 0) {
    const t = -q.x / (p.x - q.x);
    q = { x: 0, y: q.y + t * (p.y - q.y) };
  }
  const dx = q.x - p.x,
    dy = q.y - p.y,
    d2 = dx * dx + dy * dy,
    t = d2 ? clamp(-(p.x * dx + p.y * dy) / d2, 0, 1) : 0;
  return (p.x + t * dx) ** 2 + (p.y + t * dy) ** 2 <= 1 + 1e-9;
}
export function robotInGoalArea(r: Robot, side: number, c: Config) {
  const corners = robotCorners(r, c);
  if (corners.some((p) => goalAreaContains(p, side, c))) return true;
  const x = c.length / 2,
    w = c.goalAreaWidth / 2,
    rect = [
      { x: side * x, y: -w },
      { x: side * x, y: w },
      { x: side * (x - c.goalAreaDepth), y: w },
      { x: side * (x - c.goalAreaDepth), y: -w },
    ];
  if (
    rect.some((p) => pointInRobot(p, r, c)) ||
    pointInRobot({ x: side * (x - c.goalAreaDepth), y: 0 }, r, c)
  )
    return true;
  return corners.some(
    (p, i) =>
      crossesHalfEllipse(p, corners[(i + 1) % 4], side, c) ||
      rect.some((q, j) =>
        segmentsIntersect(p, corners[(i + 1) % 4], q, rect[(j + 1) % 4]),
      ),
  );
}
export function ownArea(r: Robot, s: Match) {
  return robotInGoalArea(r, -direction(r.team, s.period), s.config);
}
export function keeperFor(s: Match, team: Team) {
  const eligible = s.robots.filter((r) => r.team === team && isActive(r));
  const occupants = eligible.filter((r) => ownArea(r, s));
  if (occupants.length)
    return occupants.sort(
      (a, b) =>
        (s.officials.areaTicks[b.id] ?? 0) -
          (s.officials.areaTicks[a.id] ?? 0) || a.id.localeCompare(b.id),
    )[0];
  return eligible.find((r) => r.role === "keeper") ?? eligible[0];
}
export function boundBody(r: Robot, c: Config) {
  const radius = robotRadius(c);
  r.x = clamp(r.x, -c.length / 2 + radius, c.length / 2 - radius);
  r.y = clamp(r.y, -c.width / 2 + radius, c.width / 2 - radius);
  if (c.cornerChamfer === 0) return;
  const overlap =
    (Math.abs(r.x) +
      Math.abs(r.y) -
      (c.length / 2 + c.width / 2 - c.cornerChamfer - radius * Math.SQRT2)) /
    2;
  if (overlap > 0) {
    r.x -= Math.sign(r.x) * overlap;
    r.y -= Math.sign(r.y) * overlap;
  }
}
export function fieldOutline(c: Config): Point[] {
  const x = c.length / 2,
    y = c.width / 2,
    k = c.cornerChamfer;
  return [
    { x: -x + k, y: -y },
    { x: x - k, y: -y },
    { x, y: -y + k },
    { x, y: y - k },
    { x: x - k, y },
    { x: -x + k, y },
    { x: -x, y: y - k },
    { x: -x, y: -y + k },
  ];
}
export function ballBetween(a: Point, b: Point, ball: Point, c: Config) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    d2 = dx * dx + dy * dy;
  if (d2 === 0) return false;
  const t = ((ball.x - a.x) * dx + (ball.y - a.y) * dy) / d2;
  return (
    t > 0 &&
    t < 1 &&
    distance(ball, { x: a.x + t * dx, y: a.y + t * dy }) <= 0.02135 + 0.012
  );
}
