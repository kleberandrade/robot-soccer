import {
  type Match,
  type Robot,
  type Team,
  type RestartKind,
  direction,
  isActive,
  stopWheels,
  recordEvent,
  clamp,
  robotRadius,
} from "./model";
import { distance, keeperFor } from "./geometry";
function pose(r: Robot, s: Match, x: number, y: number, angle: number) {
  r.x = clamp(
    x,
    -s.config.length / 2 + s.config.robotSide / 2,
    s.config.length / 2 - s.config.robotSide / 2,
  );
  r.y = clamp(
    y,
    -s.config.width / 2 + s.config.robotSide / 2,
    s.config.width / 2 - s.config.robotSide / 2,
  );
  r.angle = angle;
}
function takerFor(s: Match, team: Team) {
  return (
    s.robots.find(
      (r) => r.team === team && r.role === "striker" && isActive(r),
    ) ?? s.robots.find((r) => r.team === team && isActive(r))
  );
}
const angleFor = (sign: number) => (sign === 1 ? 0 : Math.PI);
function waitingRobots(
  s: Match,
  taker: Robot | undefined,
  keeper: Robot | undefined,
) {
  return s.robots.filter(
    (r) => isActive(r) && r.id !== taker?.id && r.id !== keeper?.id,
  );
}
function placeShot(
  s: Match,
  sign: number,
  taker: Robot | undefined,
  keeper: Robot | undefined,
) {
  if (taker)
    pose(
      taker,
      s,
      s.ball.x - sign * (robotRadius(s.config) + 0.036),
      0,
      angleFor(sign),
    );
  if (keeper)
    pose(
      keeper,
      s,
      sign * (s.config.length / 2 - s.config.robotSide / 2),
      0,
      angleFor(-sign),
    );
  return { takerId: taker?.id ?? null, keeperId: keeper?.id ?? null };
}
function penaltyPositions(s: Match, team: Team) {
  const sign = direction(team, s.period),
    taker = takerFor(s, team),
    keeper = keeperFor(s, team === "blue" ? "yellow" : "blue");
  const ids = placeShot(s, sign, taker, keeper);
  waitingRobots(s, taker, keeper).forEach((r, i) =>
    pose(
      r,
      s,
      -sign * (s.config.robotSide / 2 + 0.04),
      s.config.width * [-0.33, -0.11, 0.11, 0.33][i],
      angleFor(sign),
    ),
  );
  return ids;
}
function freeKickPositions(s: Match, team: Team) {
  const sign = direction(team, s.period),
    taker = takerFor(s, team),
    keeper = keeperFor(s, team === "blue" ? "yellow" : "blue");
  const ids = placeShot(s, sign, taker, keeper),
    waiting = waitingRobots(s, taker, keeper);
  waiting
    .filter((r) => r.team === team)
    .forEach((r, i) =>
      pose(
        r,
        s,
        sign * s.config.length * 0.08,
        s.config.width * (i ? -0.3 : 0.3),
        angleFor(sign),
      ),
    );
  waiting
    .filter((r) => r.team !== team)
    .forEach((r, i) =>
      pose(
        r,
        s,
        sign *
          (s.config.length / 2 -
            s.config.goalAreaDepth +
            s.config.robotSide / 2),
        (i ? -1 : 1) *
          (s.config.goalAreaWidth / 2 + robotRadius(s.config) + 0.01),
        angleFor(-sign),
      ),
    );
  return ids;
}
function goalKickPositions(s: Match, team: Team) {
  const sign = direction(team, s.period),
    keeper = keeperFor(s, team);
  if (keeper)
    pose(
      keeper,
      s,
      s.ball.x - sign * (robotRadius(s.config) + 0.036),
      0,
      angleFor(sign),
    );
  const waiting = waitingRobots(s, keeper, keeper);
  waiting
    .filter((r) => r.team === team)
    .forEach((r, i) =>
      pose(
        r,
        s,
        -sign * s.config.length * 0.13,
        (i ? -1 : 1) * s.config.width * 0.26,
        angleFor(sign),
      ),
    );
  waiting
    .filter((r) => r.team !== team)
    .forEach((r, i) =>
      pose(
        r,
        s,
        i === 0
          ? (-sign * s.config.robotSide) / 2
          : sign * s.config.length * 0.25,
        (i === 1 ? -1 : 1) * s.config.width * 0.3,
        angleFor(-sign),
      ),
    );
  const id = keeper?.id ?? null;
  return { takerId: id, keeperId: id };
}
function kickoffPositions(s: Match, team: Team) {
  for (const t of ["blue", "yellow"] as Team[]) {
    const sign = direction(t, s.period);
    s.robots
      .filter((r) => r.team === t)
      .forEach((r, i) => {
        if (isActive(r))
          pose(
            r,
            s,
            -sign * s.config.length * [0.16, 0.3, 0.44][i],
            i === 1 ? s.config.width * 0.2 : 0,
            sign === 1 ? 0 : Math.PI,
          );
      });
  }
  return { takerId: takerFor(s, team)?.id ?? null, keeperId: null };
}
function freeBallPositions(s: Match) {
  for (const team of ["blue", "yellow"] as Team[]) {
    const candidates = s.robots
      .filter((r) => r.team === team && isActive(r))
      .sort((a, b) => distance(a, s.ball) - distance(b, s.ball));
    let i = 0;
    for (const r of candidates) {
      if (i === 0)
        pose(
          r,
          s,
          s.ball.x - direction(team, s.period) * 0.2,
          s.ball.y,
          direction(team, s.period) === 1 ? 0 : Math.PI,
        );
      else
        pose(
          r,
          s,
          -Math.sign(s.ball.x) * s.config.length * (0.15 + 0.12 * i),
          (team === "blue" ? 1 : -1) * s.config.width * (0.18 + 0.12 * i),
          direction(team, s.period) === 1 ? 0 : Math.PI,
        );
      i++;
    }
  }
  return { takerId: null, keeperId: null };
}
export function positionRestart(s: Match) {
  const r = s.restart;
  if (!r) return;
  stopWheels(s);
  s.ball = { x: r.x, y: r.y, vx: 0, vy: 0 };
  if (r.kind === "free-ball") {
    Object.assign(r, freeBallPositions(s));
    return;
  }
  if (r.team === null) return;
  const placements = {
    kickoff: kickoffPositions,
    penalty: penaltyPositions,
    "free-kick": freeKickPositions,
    "goal-kick": goalKickPositions,
  };
  Object.assign(r, placements[r.kind](s, r.team));
}
export function setRestart(
  s: Match,
  kind: RestartKind,
  team: Team | null,
  spot?: { x: number; y: number },
) {
  const sign = team ? direction(team, s.period) : 1;
  let x = (sign * s.config.length) / 4,
    y = 0;
  if (kind === "kickoff") x = 0;
  if (kind === "goal-kick")
    x = -sign * (s.config.length / 2 - s.config.goalAreaDepth);
  if (kind === "free-ball") {
    x = (Math.sign(spot?.x || 1) * s.config.length) / 4;
    y = Math.sign(spot?.y || 1) * (s.config.width / 2 - 0.25);
  }
  s.restart = {
    kind,
    team,
    x,
    y,
    takerId: null,
    keeperId: null,
    stage: "setup",
    warnings: { blue: 0, yellow: 0 },
  };
  s.phase = "stoppage";
  s.phaseTicks = 0;
  s.officials.keeperTicks = { blue: 0, yellow: 0 };
  s.officials.pushingTicks = {};
  s.officials.stalledTicks = 0;
  s.officials.areaTicks = {};
  s.officials.forcedArea = {};
  s.officials.anchor = { x, y };
  positionRestart(s);
}
export function releaseRestart(s: Match) {
  if (!s.restart) return;
  s.restart.stage = "live";
  recordEvent(s, {
    kind: "whistle",
    team: s.restart.team,
    restart: s.restart.kind,
    source: "referee",
    message: "Whistle: all active robots may move autonomously.",
  });
}
export function clearLiveRestart(s: Match) {
  if (s.restart?.stage === "live" && distance(s.ball, s.restart) > 0.05)
    s.restart = null;
}
