export * from "./model";
export { parseCommands } from "@robot-soccer/protocol";
export { decideReferee } from "./referee";
export { hydrateMatch, MatchSchema } from "./compatibility";
import { parseCommands, type Command, type Team } from "@robot-soccer/protocol";
import {
  type ConfigInput,
  type Match,
  type Robot,
  type Strategy,
  type Action,
  ConfigSchema,
  CONFIG,
  emptyOfficials,
  stopWheels,
  recordEvent,
  otherTeam,
} from "./model";
import { autonomous } from "./teams";
import { simulatePhysics } from "./physics";
import { automaticReferee, restoreExcluded } from "./referee";
import { setRestart, releaseRestart, clearLiveRestart } from "./restarts";
function initialRobots(): Robot[] {
  return (["blue", "yellow"] as Team[]).flatMap((team) =>
    (["striker", "defender", "keeper"] as const).map((role, i) => ({
      id: `${team}-${i}`,
      team,
      role,
      x: 0,
      y: 0,
      angle: 0,
      left: 0,
      right: 0,
      targetLeft: 0,
      targetRight: 0,
      leftRotation: 0,
      rightRotation: 0,
      excludedUntil: null,
      releaseOnScore: null,
    })),
  );
}
export function createMatch(
  config: ConfigInput = CONFIG,
  strategies: Record<Team, Strategy> = { blue: "balanced", yellow: "press" },
): Match {
  const s: Match = {
    version: 2,
    config: ConfigSchema.parse(config),
    tick: 0,
    elapsedTicks: 0,
    period: 1,
    phase: "ready",
    phaseTicks: 0,
    score: { blue: 0, yellow: 0 },
    timeouts: { blue: 0, yellow: 0 },
    strategies: { ...strategies },
    robots: initialRobots(),
    ball: { x: 0, y: 0, vx: 0, vy: 0 },
    restart: null,
    officials: emptyOfficials(),
  };
  setRestart(s, "kickoff", "blue");
  s.phase = "ready";
  return s;
}
export function referee(state: Match, action: Action): Match {
  const s = structuredClone(state);
  if (action === "reset") return createMatch(s.config, s.strategies);
  if (action === "start") {
    if (!["ready", "paused", "stoppage"].includes(s.phase))
      throw new Error("Only ready, paused or stopped matches can start");
    s.phase = "running";
    if (s.restart?.stage === "setup") releaseRestart(s);
    return s;
  }
  if (s.phase !== "running")
    throw new Error("Referee action requires a running match");
  stopWheels(s);
  if (action === "pause") {
    s.phase = "paused";
    return s;
  }
  return consumeTimeout(s, action);
}
function consumeTimeout(s: Match, action: Action) {
  const team = action === "timeout-blue" ? "blue" : "yellow";
  if (s.timeouts[team] >= s.config.timeoutLimit)
    throw new Error("Timeout allowance already used");
  s.timeouts[team]++;
  s.phase = "timeout";
  s.phaseTicks = 0;
  return s;
}
export function observe(s: Match, team: Team) {
  return { version: 1 as const, team, state: structuredClone(s) };
}
function phaseClock(s: Match) {
  s.phaseTicks++;
  const seconds =
    s.phase === "halftime" ? s.config.intervalSeconds : s.config.timeoutSeconds;
  if (s.phaseTicks < seconds * 60) return;
  if (s.phase === "halftime") {
    s.period = 2;
    setRestart(s, "kickoff", "yellow");
    if (s.config.ruleset === "user-reference" && !s.config.automaticReferee) {
      s.phase = "running";
      releaseRestart(s);
    }
  } else s.phase = "running";
  s.phaseTicks = 0;
}
function finishPeriod(s: Match) {
  if (s.elapsedTicks < s.config.halfSeconds * 60 * s.period) return;
  s.phase = s.period === 1 ? "halftime" : "finished";
  s.phaseTicks = 0;
  s.restart = null;
  stopWheels(s);
}
function validateCommands(commands: Command[]) {
  const valid = (["blue", "yellow"] as Team[]).flatMap((team) =>
    parseCommands(
      team,
      commands.filter((c) => c.id.startsWith(team + "-")),
    ),
  );
  if (valid.length !== commands.length) throw new Error("Unknown robot ID");
  return valid;
}
function scoreGoal(s: Match, team: Team) {
  s.score[team]++;
  restoreExcluded(s);
  setRestart(s, "kickoff", otherTeam(team));
  recordEvent(s, {
    kind: "goal",
    team,
    restart: "kickoff",
    source: "system",
    message: `Goal for ${team}. Kickoff for ${otherTeam(team)} awaits the whistle.`,
  });
}
export function step(state: Match, commands: Command[]): Match {
  if (["ready", "paused", "stoppage", "finished"].includes(state.phase))
    return structuredClone(state);
  const s = structuredClone(state);
  s.tick++;
  if (s.phase !== "running") {
    phaseClock(s);
    return s;
  }
  const physics = simulatePhysics(s, validateCommands(commands));
  s.elapsedTicks++;
  if (physics.goal) scoreGoal(s, physics.goal);
  else automaticReferee(s, state, physics);
  finishPeriod(s);
  restoreExcluded(s);
  clearLiveRestart(s);
  return s;
}
export function advance(state: Match, ticks: number): Match {
  if (!Number.isInteger(ticks) || ticks < 1 || ticks > 120)
    throw new Error("Batch must contain 1–120 ticks");
  let s = state;
  for (let i = 0; i < ticks; i++) {
    if (["ready", "paused", "stoppage", "finished"].includes(s.phase)) break;
    const commands = (["blue", "yellow"] as Team[]).flatMap((team) =>
      parseCommands(team, autonomous(observe(s, team), s.strategies[team])),
    );
    s = step(s, commands);
  }
  return structuredClone(s);
}
