import {
  type Match,
  type Robot,
  type Config,
  type Team,
  type Command,
  DT,
  BALL_RADIUS,
  robotRadius,
  clamp,
  direction,
  isActive,
} from "./model";
import { boundBody, ballBetween } from "./geometry";
export type Contact = {
  a: string;
  b: string;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  ballBetween: boolean;
};
export type PhysicsResult = {
  contacts: Contact[];
  ballTouches: string[];
  goal: Team | null;
};
function wheelVelocity(current: number, target: number, c: Config) {
  if (c.motorAcceleration === 0) return target;
  const delta = c.motorAcceleration * DT;
  return current + clamp(target - current, -delta, delta);
}
export function moveRobot(r: Robot, c: Config, command?: Command) {
  r.targetLeft = command?.left ?? 0;
  r.targetRight = command?.right ?? 0;
  r.left = wheelVelocity(r.left, r.targetLeft, c);
  r.right = wheelVelocity(r.right, r.targetRight, c);
  const v = (r.left + r.right) / 2,
    w = (r.right - r.left) / c.wheelBase,
    a = r.angle + w * DT;
  if (Math.abs(w) < 1e-9) {
    r.x += v * Math.cos(r.angle) * DT;
    r.y += v * Math.sin(r.angle) * DT;
  } else {
    r.x += (v / w) * (Math.sin(a) - Math.sin(r.angle));
    r.y -= (v / w) * (Math.cos(a) - Math.cos(r.angle));
  }
  r.angle = Math.atan2(Math.sin(a), Math.cos(a));
  r.leftRotation += (r.left * DT) / c.wheelRadius;
  r.rightRotation += (r.right * DT) / c.wheelRadius;
  boundBody(r, c);
}
function separate(a: Robot, b: Robot, c: Config) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    d = Math.hypot(dx, dy),
    radius = robotRadius(c);
  if (d >= 2 * radius) return;
  const nx = d ? dx / d : 1,
    ny = d ? dy / d : 0,
    overlap = (2 * radius - d) / 2;
  a.x -= nx * overlap;
  a.y -= ny * overlap;
  b.x += nx * overlap;
  b.y += ny * overlap;
  boundBody(a, c);
  boundBody(b, c);
}
function contactsFor(s: Match, robots: Robot[]): Contact[] {
  const contacts: Contact[] = [];
  for (let i = 0; i < robots.length; i++)
    for (let j = i + 1; j < robots.length; j++) {
      const a = robots[i],
        b = robots[j];
      if (Math.hypot(b.x - a.x, b.y - a.y) > 2 * robotRadius(s.config) + 0.003)
        continue;
      contacts.push({
        a: a.id,
        b: b.id,
        ax: a.x,
        ay: a.y,
        bx: b.x,
        by: b.y,
        ballBetween: ballBetween(a, b, s.ball, s.config),
      });
    }
  return contacts;
}
function resolveRobots(robots: Robot[], c: Config) {
  for (let pass = 0; pass < 3; pass++)
    for (let i = 0; i < robots.length; i++)
      for (let j = i + 1; j < robots.length; j++)
        separate(robots[i], robots[j], c);
}
function collideBall(s: Match, r: Robot) {
  const b = s.ball,
    dx = b.x - r.x,
    dy = b.y - r.y,
    d = Math.hypot(dx, dy),
    min = robotRadius(s.config) + BALL_RADIUS;
  if (d >= min) return;
  const nx = d ? dx / d : 1,
    ny = d ? dy / d : 0;
  b.x = r.x + nx * min;
  b.y = r.y + ny * min;
  const speed = (r.left + r.right) / 2,
    relative =
      (b.vx - speed * Math.cos(r.angle)) * nx +
      (b.vy - speed * Math.sin(r.angle)) * ny;
  if (relative < 0) {
    b.vx -= 1.5 * relative * nx;
    b.vy -= 1.5 * relative * ny;
  }
}
function goalFor(s: Match): Team | null {
  const b = s.ball,
    c = s.config;
  if (
    Math.abs(b.y) > c.goalWidth / 2 - BALL_RADIUS ||
    Math.abs(b.x) <= c.length / 2 + BALL_RADIUS
  )
    return null;
  return direction("blue", s.period) === Math.sign(b.x) ? "blue" : "yellow";
}
function chamferBall(s: Match) {
  const b = s.ball,
    c = s.config;
  if (c.cornerChamfer === 0) return;
  const limit =
      c.length / 2 + c.width / 2 - c.cornerChamfer - BALL_RADIUS * Math.SQRT2,
    penetration = Math.abs(b.x) + Math.abs(b.y) - limit;
  if (penetration <= 0) return;
  const nx = Math.sign(b.x) / Math.SQRT2,
    ny = Math.sign(b.y) / Math.SQRT2;
  b.x -= (Math.sign(b.x) * penetration) / 2;
  b.y -= (Math.sign(b.y) * penetration) / 2;
  const v = b.vx * nx + b.vy * ny;
  if (v > 0) {
    b.vx -= 1.75 * v * nx;
    b.vy -= 1.75 * v * ny;
  }
}
function walls(s: Match) {
  const b = s.ball,
    c = s.config;
  if (Math.abs(b.y) > c.width / 2 - BALL_RADIUS) {
    b.y = clamp(b.y, -c.width / 2 + BALL_RADIUS, c.width / 2 - BALL_RADIUS);
    if (Math.sign(b.y) * b.vy > 0) b.vy *= -0.75;
  }
  if (
    Math.abs(b.y) > c.goalWidth / 2 - BALL_RADIUS &&
    Math.abs(b.x) > c.length / 2 - BALL_RADIUS
  ) {
    b.x = clamp(b.x, -c.length / 2 + BALL_RADIUS, c.length / 2 - BALL_RADIUS);
    if (Math.sign(b.x) * b.vx > 0) b.vx *= -0.75;
  }
  chamferBall(s);
}
export function simulatePhysics(s: Match, commands: Command[]): PhysicsResult {
  const robots = s.robots.filter(isActive);
  for (const r of robots)
    moveRobot(
      r,
      s.config,
      commands.find((c) => c.id === r.id),
    );
  const contacts = contactsFor(s, robots),
    ballTouches = robots
      .filter(
        (r) =>
          Math.hypot(r.x - s.ball.x, r.y - s.ball.y) <=
          robotRadius(s.config) + BALL_RADIUS + 0.002,
      )
      .map((r) => r.id);
  resolveRobots(robots, s.config);
  s.ball.x += s.ball.vx * DT;
  s.ball.y += s.ball.vy * DT;
  s.ball.vx *= 0.99;
  s.ball.vy *= 0.99;
  let goal = goalFor(s);
  if (goal) return { contacts, ballTouches, goal };
  for (const r of robots) collideBall(s, r);
  goal = goalFor(s);
  if (!goal) walls(s);
  return { contacts, ballTouches, goal };
}
