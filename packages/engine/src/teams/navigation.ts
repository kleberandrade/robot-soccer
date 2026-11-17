import {
  type Observation,
  type Robot,
  type Command,
  clamp,
  direction,
  isActive,
  robotRadius,
} from "../model";
import { distance, ballBetween } from "../geometry";
export type Target = { x: number; y: number };
/** Convert a field target into wheel speeds; the engine applies motor acceleration. */
export function navigate(o: Observation, r: Robot, target: Target): Command {
  const dx = target.x - r.x,
    dy = target.y - r.y,
    error = Math.atan2(
      Math.sin(Math.atan2(dy, dx) - r.angle),
      Math.cos(Math.atan2(dy, dx) - r.angle),
    );
  let v = Math.min(0.45, Math.hypot(dx, dy) * 3) * Math.max(0, Math.cos(error));
  const omega = clamp(error * 6, -6, 6),
    halfTrack = o.state.config.wheelBase / 2;
  if (blocked(o, r)) v = 0;
  return {
    id: r.id,
    left: clamp(v - omega * halfTrack, -0.6, 0.6),
    right: clamp(v + omega * halfTrack, -0.6, 0.6),
  };
}
function blocked(o: Observation, r: Robot) {
  return o.state.robots.some(
    (q) =>
      q.id !== r.id &&
      isActive(q) &&
      distance(r, q) < 2 * robotRadius(o.state.config) + 0.03 &&
      !ballBetween(r, q, o.state.ball, o.state.config) &&
      Math.cos(r.angle) * (q.x - r.x) + Math.sin(r.angle) * (q.y - r.y) > 0.02,
  );
}
export function approachBall(o: Observation, r: Robot): Target {
  const b = o.state.ball,
    sign = direction(o.team, o.state.period),
    ahead = (r.x - b.x) * sign > 0;
  if (ahead) return { x: b.x - sign * 0.13, y: b.y + (b.y > 0 ? -0.16 : 0.16) };
  return { x: b.x + sign * 0.08, y: b.y };
}
export function restartTarget(o: Observation, r: Robot) {
  if (
    o.state.restart?.stage === "live" &&
    o.state.restart.takerId === r.id &&
    o.state.restart.kind !== "kickoff"
  )
    return approachBall(o, r);
  return null;
}
