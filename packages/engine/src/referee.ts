import {
  type Match,
  type Team,
  type Robot,
  type Decision,
  DecisionSchema,
  direction,
  otherTeam,
  isActive,
  recordEvent,
  stopWheels,
} from "./model";
import {
  distance,
  goalAreaContains,
  ownArea,
  robotInGoalArea,
  keeperFor,
} from "./geometry";
import { type Contact, type PhysicsResult } from "./physics";
import { setRestart, positionRestart } from "./restarts";
const bothTeams: Team[] = ["blue", "yellow"];
export function updateAreaTimers(s: Match) {
  for (const r of s.robots) {
    const inside = isActive(r) && ownArea(r, s);
    s.officials.areaTicks[r.id] = inside
      ? (s.officials.areaTicks[r.id] ?? 0) + 1
      : 0;
    const attack = "attack:" + r.id;
    s.officials.areaTicks[attack] =
      isActive(r) && robotInGoalArea(r, direction(r.team, s.period), s.config)
        ? (s.officials.areaTicks[attack] ?? 0) + 1
        : 0;
    if (!inside) delete s.officials.forcedArea[r.id];
  }
}
function activeContacts(s: Match, r: Robot, physics: PhysicsResult) {
  if (physics.ballTouches.includes(r.id)) return true;
  return physics.contacts.some(
    (c) =>
      !c.ballBetween &&
      (c.a === r.id || c.b === r.id) &&
      s.robots.find((q) => q.id === (c.a === r.id ? c.b : c.a))?.team !==
        r.team,
  );
}
function participating(s: Match, robots: Robot[], physics: PhysicsResult) {
  return robots.some(
    (r) => !s.officials.forcedArea[r.id] && activeContacts(s, r, physics),
  );
}
function defendingOverload(
  s: Match,
  team: Team,
  side: number,
  physics: PhysicsResult,
) {
  const own = s.robots.filter(
      (r) =>
        r.team === team && isActive(r) && robotInGoalArea(r, side, s.config),
    ),
    keeper = keeperFor(s, team);
  return (
    own.length > 1 &&
    goalAreaContains(s.ball, side, s.config) &&
    participating(
      s,
      own.filter((r) => r.id !== keeper?.id),
      physics,
    )
  );
}
function attackingOverload(
  s: Match,
  team: Team,
  side: number,
  physics: PhysicsResult,
) {
  const attackers = s.robots.filter(
    (r) => r.team === team && isActive(r) && robotInGoalArea(r, side, s.config),
  );
  attackers.sort(
    (a, b) =>
      (s.officials.areaTicks["attack:" + b.id] ?? 0) -
      (s.officials.areaTicks["attack:" + a.id] ?? 0),
  );
  return attackers.length > 1 && participating(s, attackers.slice(1), physics);
}
function overload(s: Match, physics: PhysicsResult): Decision | null {
  for (const team of bothTeams) {
    const side = -direction(team, s.period);
    if (defendingOverload(s, team, side, physics))
      return { kind: "defensive-overload", team };
    if (attackingOverload(s, otherTeam(team), side, physics))
      return { kind: "attacking-overload", team: otherTeam(team) };
  }
  return null;
}
function velocity(r: Robot) {
  const v = (r.left + r.right) / 2;
  return { x: v * Math.cos(r.angle), y: v * Math.sin(r.angle) };
}
function aggressor(s: Match, c: Contact) {
  const a = s.robots.find((r) => r.id === c.a)!,
    b = s.robots.find((r) => r.id === c.b)!;
  if (a.team === b.team || c.ballBetween) return null;
  const d = Math.hypot(c.bx - c.ax, c.by - c.ay);
  if (d < 1e-9) return null;
  const nx = (c.bx - c.ax) / d,
    ny = (c.by - c.ay) / d,
    va = velocity(a),
    vb = velocity(b),
    av = va.x * nx + va.y * ny,
    bv = -vb.x * nx - vb.y * ny;
  if (av > 0.15 && av > bv + 0.05) return { actor: a, victim: b };
  if (bv > 0.15 && bv > av + 0.05) return { actor: b, victim: a };
  return null;
}
function markForcedEntry(s: Match, previous: Match, victim: Robot) {
  const old = previous.robots.find((r) => r.id === victim.id)!;
  if (!ownArea(old, previous) && ownArea(victim, s))
    s.officials.forcedArea[victim.id] = true;
}
function pushing(
  s: Match,
  previous: Match,
  physics: PhysicsResult,
): Decision | null {
  const current: Record<string, number> = {};
  let foul: Decision | null = null;
  for (const c of physics.contacts) {
    const pair = aggressor(s, c);
    if (!pair) continue;
    const { actor, victim } = pair,
      key = actor.id + ">" + victim.id;
    current[key] = (s.officials.pushingTicks[key] ?? 0) + 1;
    markForcedEntry(s, previous, victim);
    if (current[key] >= Math.ceil(s.config.pushingSeconds * 60)) {
      const keeper = keeperFor(s, victim.team);
      foul = {
        kind:
          keeper?.id === victim.id && ownArea(victim, s)
            ? "goalkeeper-push"
            : "personal-foul",
        team: actor.team,
        robotId: actor.id,
      };
    }
  }
  s.officials.pushingTicks = current;
  return foul;
}
function possession(s: Match): Decision | null {
  for (const team of bothTeams) {
    const keeper = keeperFor(s, team);
    if (!keeper) {
      s.officials.keeperTicks[team] = 0;
      continue;
    }
    const held =
      goalAreaContains(s.ball, -direction(team, s.period), s.config) &&
      distance(keeper, s.ball) <
        s.config.robotSide / Math.SQRT2 + 0.02135 + 0.02;
    const challenged = s.robots.some(
      (r) => r.team !== team && isActive(r) && distance(r, s.ball) < 0.12,
    );
    s.officials.keeperTicks[team] =
      held && !challenged ? s.officials.keeperTicks[team] + 1 : 0;
    if (s.officials.keeperTicks[team] >= 600)
      return { kind: "keeper-retention", team };
  }
  return null;
}
function stalemate(s: Match): Decision | null {
  if (distance(s.ball, s.officials.anchor) > 0.02) {
    s.officials.anchor = { x: s.ball.x, y: s.ball.y };
    s.officials.stalledTicks = 0;
  }
  const near = bothTeams.every((team) =>
    s.robots.some(
      (r) => r.team === team && isActive(r) && distance(r, s.ball) < 0.12,
    ),
  );
  s.officials.stalledTicks = near ? s.officials.stalledTicks + 1 : 0;
  if (s.officials.stalledTicks < 600) return null;
  const defending = bothTeams.find((t) =>
    goalAreaContains(s.ball, -direction(t, s.period), s.config),
  );
  return defending
    ? { kind: "goal-area-stalemate", team: otherTeam(defending) }
    : { kind: "free-ball", team: "blue" };
}
function excludeKeeper(s: Match, team: Team) {
  const r = keeperFor(s, team);
  if (!r) return;
  r.excludedUntil = s.elapsedTicks + 1800;
  r.releaseOnScore = s.score[otherTeam(team)] + 1;
  r.x = 0;
  r.y = s.config.width / 2 + 0.12;
  stopWheels(s);
  recordEvent(s, {
    kind: "exclusion",
    team,
    restart: s.restart?.kind ?? null,
    source: "referee",
    message: `${r.id} excluded for 30 seconds of playing time or until the opponent scores.`,
  });
}
function penaltyFalseStart(s: Match, team: Team, n: number) {
  if (s.restart?.team === team) {
    setRestart(s, "free-ball", null, s.ball);
    return;
  }
  if (n === 2) {
    s.officials.yellowCards[team]++;
    recordEvent(s, {
      kind: "yellow-card",
      team,
      restart: "penalty",
      source: "referee",
      message: "Defending goalkeeper cautioned for repeated false start.",
    });
  } else excludeKeeper(s, team);
  positionRestart(s);
}
function kickoffFalseStart(s: Match, team: Team, n: number) {
  const r = s.restart!;
  if (n !== 2) {
    setRestart(s, "free-kick", otherTeam(team));
    return;
  }
  if (r.team === team) {
    r.team = otherTeam(team);
    positionRestart(s);
    return;
  }
  s.robots
    .filter((q) => q.team === team && isActive(q))
    .forEach((q, i) => {
      q.x =
        -direction(team, s.period) *
        (s.config.length / 2 - s.config.goalAreaDepth - 0.08);
      q.y = s.config.width * [-0.3, 0, 0.3][i];
    });
}
function escalateFalseStart(s: Match, team: Team, n: number) {
  const r = s.restart!;
  if (r.kind === "penalty") {
    penaltyFalseStart(s, team, n);
    return;
  }
  if (r.kind === "kickoff") {
    kickoffFalseStart(s, team, n);
    return;
  }
  if (r.kind === "free-kick") {
    setRestart(s, r.team === team ? "free-kick" : "penalty", otherTeam(team));
    return;
  }
  setRestart(s, "free-kick", otherTeam(team));
}
function falseStart(s: Match, team: Team) {
  const r = s.restart;
  if (!r || r.stage !== "setup")
    throw new Error("Referee false-start decision requires a stopped restart");
  const n = ++r.warnings[team];
  recordEvent(s, {
    kind: "warning",
    team,
    restart: r.kind,
    source: "referee",
    message: `False start: ${team}, warning ${n}.`,
  });
  if (n === 1) {
    positionRestart(s);
    s.phase = "stoppage";
    return;
  }
  escalateFalseStart(s, team, n);
}
function restartFor(s: Match, d: Decision) {
  if (d.kind === "free-ball") return "free-ball";
  if (
    d.kind === "attacking-overload" ||
    d.kind === "goalkeeper-push" ||
    d.kind === "goal-area-stalemate"
  )
    return "goal-kick";
  if (d.kind === "defensive-overload" || d.kind === "keeper-retention")
    return "penalty";
  const r = s.robots.find((q) => q.id === d.robotId),
    point = r ?? s.ball;
  return goalAreaContains(point, -direction(d.team, s.period), s.config)
    ? "penalty"
    : "free-kick";
}
export function awardDecision(
  s: Match,
  d: Decision,
  source: "automatic" | "referee",
) {
  if (d.kind === "false-start") {
    falseStart(s, d.team);
    return;
  }
  const kind = restartFor(s, d),
    spot = { x: s.ball.x, y: s.ball.y },
    team = kind === "free-ball" ? null : otherTeam(d.team);
  if (!["free-ball", "goal-area-stalemate"].includes(d.kind))
    s.officials.fouls[d.team]++;
  setRestart(s, kind, team, spot);
  recordEvent(s, {
    kind: d.kind,
    team: d.team,
    restart: kind,
    source,
    message: `${d.kind.replaceAll("-", " ")}: ${kind.replaceAll("-", " ")}${team ? " for " + team : ""}.`,
  });
}
export function decideReferee(state: Match, input: unknown): Match {
  const d = DecisionSchema.parse(input);
  if (!["running", "paused", "stoppage", "ready"].includes(state.phase))
    throw new Error("Referee decision requires an active or stopped match");
  const s = structuredClone(state);
  awardDecision(s, d, "referee");
  return s;
}
export function automaticReferee(
  s: Match,
  previous: Match,
  physics: PhysicsResult,
) {
  updateAreaTimers(s);
  if (!s.config.automaticReferee) return;
  const push = pushing(s, previous, physics),
    decision = overload(s, physics) ?? push ?? possession(s) ?? stalemate(s);
  if (decision) awardDecision(s, decision, "automatic");
}
export function restoreExcluded(s: Match) {
  for (const r of s.robots) {
    if (r.excludedUntil === null) continue;
    if (
      s.elapsedTicks < r.excludedUntil &&
      s.score[otherTeam(r.team)] < (r.releaseOnScore ?? Infinity)
    )
      continue;
    r.excludedUntil = null;
    r.releaseOnScore = null;
    r.x = -direction(r.team, s.period) * s.config.robotSide;
    r.y = s.config.width * 0.4;
    recordEvent(s, {
      kind: "return",
      team: r.team,
      restart: null,
      source: "system",
      message: `${r.id} may return to play.`,
    });
  }
}
