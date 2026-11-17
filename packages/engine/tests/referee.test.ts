import { describe, it, expect } from "vitest";
import {
  createMatch,
  referee,
  step,
  advance,
  CONFIG,
  USER_CONFIG,
  decideReferee,
  hydrateMatch,
} from "../src/engine";
import { goalAreaContains, robotInGoalArea } from "../src/geometry";
import type { Match, Team } from "../src/model";
function running() {
  return referee(createMatch(), "start");
}
function place(s: Match, id: string, x: number, y: number) {
  const r = s.robots.find((r) => r.id === id)!;
  r.x = x;
  r.y = y;
  r.angle = 0;
  return r;
}
function park(s: Match) {
  s.robots.forEach((r, i) => {
    r.x = i < 3 ? -0.2 : 0.2;
    r.y = [-0.5, 0, 0.5][i % 3];
  });
}
function ticks(s: Match, n: number) {
  for (let i = 0; i < n; i++) s = step(s, []);
  return s;
}
describe("VSSS automatic referee", () => {
  it("uses the organizer-linked geometry and preserves the separate user preset", () => {
    expect(CONFIG.width).toBe(1.3);
    expect(CONFIG.intervalSeconds).toBe(480);
    expect(CONFIG.timeoutLimit).toBe(2);
    expect(USER_CONFIG.width).toBe(1.2);
    expect(createMatch().version).toBe(2);
  });
  it("penalizes a participating second defender only while the ball is in the area", () => {
    const s = running();
    park(s);
    place(s, "blue-2", -0.71, 0);
    place(s, "blue-1", -0.63, 0.08);
    s.ball = { x: -0.64, y: 0.02, vx: 0, vy: 0 };
    const next = step(s, []);
    expect(next.phase).toBe("stoppage");
    expect(next.restart?.kind).toBe("penalty");
    expect(next.restart?.team).toBe("yellow");
    expect(next.officials.fouls.blue).toBe(1);
    s.ball = { x: 0, y: 0, vx: 0, vy: 0 };
    expect(step(s, []).phase).toBe("running");
  });
  it("does not penalize occupancy alone, and grants goal advantage", () => {
    const s = running();
    park(s);
    place(s, "blue-2", -0.71, -0.25);
    place(s, "blue-1", -0.63, 0.25);
    s.ball = { x: -0.7, y: 0, vx: 0, vy: 0 };
    expect(step(s, []).phase).toBe("running");
    s.ball = { x: -0.78, y: 0, vx: -1, vy: 0 };
    const goal = step(s, []);
    expect(goal.score.yellow).toBe(1);
    expect(goal.restart?.kind).toBe("kickoff");
    expect(goal.officials.fouls.blue).toBe(0);
  });
  it("awards a goal kick for two participating attackers in the opposing area", () => {
    const s = running();
    park(s);
    place(s, "blue-0", 0.63, 0.1);
    place(s, "blue-1", 0.7, -0.05);
    s.ball = { x: 0.65, y: -0.04, vx: 0, vy: 0 };
    const n = step(s, []);
    expect(n.restart?.kind).toBe("goal-kick");
    expect(n.restart?.team).toBe("yellow");
    expect(n.restart?.takerId).toBe(n.restart?.keeperId);
  });
  it("requires sustained pushing without an intervening ball, not an incidental bump", () => {
    let s = running();
    park(s);
    place(s, "blue-0", -0.05, 0);
    place(s, "yellow-0", 0.05, 0);
    s.ball = { x: 0, y: 0.4, vx: 0, vy: 0 };
    s.config.motorAcceleration = 0;
    const command = [{ id: "blue-0", left: 0.3, right: 0.3 }];
    s = step(s, command);
    expect(s.phase).toBe("running");
    for (let i = 0; i < 30 && s.phase === "running"; i++) s = step(s, command);
    expect(s.restart?.kind).toBe("free-kick");
    expect(s.restart?.team).toBe("yellow");
  });
  it("permits contact with the ball between opponents", () => {
    let s = running();
    park(s);
    place(s, "blue-0", -0.055, 0);
    place(s, "yellow-0", 0.055, 0);
    s.ball = { x: 0, y: 0, vx: 0, vy: 0 };
    s.config.motorAcceleration = 0;
    for (let i = 0; i < 20; i++)
      s = step(s, [
        { id: "blue-0", left: 0.2, right: 0.2 },
        { id: "yellow-0", left: -0.2, right: -0.2 },
      ]);
    expect(s.officials.events.some((e) => e.kind === "personal-foul")).toBe(
      false,
    );
  });
  it("penalizes 10 seconds of uncontested keeper possession and resets on a challenge", () => {
    let s = running();
    park(s);
    place(s, "blue-2", -0.7, 0);
    s.ball = { x: -0.625, y: 0, vx: 0, vy: 0 };
    s = ticks(s, 599);
    expect(s.phase).toBe("running");
    s = step(s, []);
    expect(s.restart?.kind).toBe("penalty");
    expect(s.restart?.team).toBe("yellow");
    let challenged = running();
    park(challenged);
    place(challenged, "blue-2", -0.7, 0);
    place(challenged, "yellow-0", -0.56, 0);
    challenged.ball = { x: -0.625, y: 0, vx: 0, vy: 0 };
    challenged = ticks(challenged, 100);
    expect(challenged.officials.keeperTicks.blue).toBe(0);
  });
  it("awards a neutral free ball for a 10-second midfield stalemate", () => {
    let s = running();
    park(s);
    place(s, "blue-0", -0.08, 0);
    place(s, "yellow-0", 0.08, 0);
    s.ball = { x: 0, y: 0, vx: 0, vy: 0 };
    s = ticks(s, 600);
    expect(s.restart?.kind).toBe("free-ball");
    expect(s.restart?.team).toBe(null);
  });
});
describe("set pieces and referee authority", () => {
  it("freezes time and motors, positions a penalty, and releases all six robots only on the whistle", () => {
    let s = decideReferee(running(), {
      kind: "defensive-overload",
      team: "yellow",
    });
    expect(s.restart?.x).toBe(0.375);
    expect(s.ball.x).toBe(0.375);
    expect(s.robots.filter((r) => r.x > 0)).toHaveLength(2);
    const keeper = s.robots.find((r) => r.id === s.restart?.keeperId)!;
    expect(keeper.x + s.config.robotSide / 2).toBeCloseTo(0.75, 10);
    expect(s.robots.every((r) => r.left === 0 && r.right === 0)).toBe(true);
    expect(advance(s, 120)).toEqual(s);
    s = referee(s, "start");
    expect(s.phase).toBe("running");
    expect(advance(s, 6).elapsedTicks).toBe(6);
  });
  it("mirrors penalties in the second half and respects custom field dimensions", () => {
    const s = running();
    s.period = 2;
    s.config.length = 2;
    const n = decideReferee(s, { kind: "defensive-overload", team: "yellow" });
    expect(n.ball.x).toBe(-0.5);
    expect(
      n.robots.every((r) => Math.abs(r.x) <= 1 && Math.abs(r.y) <= 0.65),
    ).toBe(true);
  });
  it("tracks warnings and escalates repeated penalty false starts", () => {
    let s = decideReferee(running(), {
      kind: "defensive-overload",
      team: "yellow",
    });
    s = decideReferee(s, { kind: "false-start", team: "blue" });
    expect(s.restart?.warnings.blue).toBe(1);
    expect(s.restart?.kind).toBe("penalty");
    s = decideReferee(s, { kind: "false-start", team: "blue" });
    expect(s.restart?.kind).toBe("free-ball");
    let d = decideReferee(running(), {
      kind: "defensive-overload",
      team: "yellow",
    });
    for (let i = 0; i < 3; i++)
      d = decideReferee(d, { kind: "false-start", team: "yellow" });
    expect(d.officials.yellowCards.yellow).toBe(1);
    expect(d.robots.filter((r) => r.excludedUntil !== null)).toHaveLength(1);
  });
  it("rejects invalid referee calls without mutating the caller and bounds event history", () => {
    const s = running(),
      original = structuredClone(s);
    expect(() =>
      decideReferee(s, { kind: "not-a-foul", team: "blue" }),
    ).toThrow();
    expect(s).toEqual(original);
    let n = s;
    for (let i = 0; i < 40; i++) {
      n = decideReferee(n, {
        kind: "personal-foul",
        team: i % 2 ? "blue" : "yellow",
      });
      n = referee(n, "start");
    }
    expect(n.officials.events.length).toBeLessThanOrEqual(32);
    expect(n.officials.eventCount).toBeGreaterThan(40);
  });
  it("upgrades an old persisted match without changing its clock, score or wheel pose", () => {
    const old = {
      ...createMatch(USER_CONFIG),
      version: 1,
      timeouts: { blue: true, yellow: false },
    };
    delete (old as Record<string, unknown>).restart;
    delete (old as Record<string, unknown>).officials;
    const n = hydrateMatch(old);
    expect(n.version).toBe(2);
    expect(n.timeouts.blue).toBe(1);
    expect(n.config.automaticReferee).toBe(false);
    expect(n.score).toEqual(old.score);
    expect(old.version).toBe(1);
  });
});
it("counts the elliptical extension and any robot overlap with the goal area", () => {
  const c = createMatch().config;
  expect(goalAreaContains({ x: 0.56, y: 0 }, 1, c)).toBe(true);
  expect(goalAreaContains({ x: 0.56, y: 0.2 }, 1, c)).toBe(false);
  const r = createMatch().robots[0];
  r.x = 0.58;
  r.y = 0.3;
  r.angle = Math.PI / 4;
  expect(robotInGoalArea(r, 1, c)).toBe(true);
});
it("allows the first attacker to play while a second attacker remains passive", async () => {
  const { automaticReferee } = await import("../src/referee");
  const s = running();
  park(s);
  place(s, "blue-0", 0.65, 0);
  place(s, "blue-1", 0.65, 0.25);
  s.officials.areaTicks["attack:blue-0"] = 20;
  s.officials.areaTicks["attack:blue-1"] = 2;
  automaticReferee(s, structuredClone(s), {
    contacts: [],
    ballTouches: ["blue-0"],
    goal: null,
  });
  expect(s.phase).toBe("running");
  automaticReferee(s, structuredClone(s), {
    contacts: [],
    ballTouches: ["blue-1"],
    goal: null,
  });
  expect(s.restart?.kind).toBe("goal-kick");
});
it("exempts a defender forced into its own area until it leaves", async () => {
  const { automaticReferee } = await import("../src/referee");
  const s = running();
  park(s);
  place(s, "blue-2", -0.71, 0);
  place(s, "blue-1", -0.63, 0.08);
  s.ball = { x: -0.64, y: 0.02, vx: 0, vy: 0 };
  s.officials.forcedArea["blue-1"] = true;
  automaticReferee(s, structuredClone(s), {
    contacts: [],
    ballTouches: ["blue-1"],
    goal: null,
  });
  expect(s.phase).toBe("running");
  place(s, "blue-1", 0, 0.4);
  automaticReferee(s, structuredClone(s), {
    contacts: [],
    ballTouches: [],
    goal: null,
  });
  expect(s.officials.forcedArea["blue-1"]).toBeUndefined();
});
it("restores an excluded keeper after 30 playing seconds or an opponent goal", async () => {
  const { restoreExcluded } = await import("../src/referee");
  const s = running(),
    r = s.robots[2];
  r.excludedUntil = 1800;
  r.releaseOnScore = 1;
  s.elapsedTicks = 1799;
  restoreExcluded(s);
  expect(r.excludedUntil).toBe(1800);
  s.elapsedTicks = 1800;
  restoreExcluded(s);
  expect(r.excludedUntil).toBeNull();
  r.excludedUntil = 3600;
  r.releaseOnScore = 1;
  s.score.yellow = 1;
  restoreExcluded(s);
  expect(r.excludedUntil).toBeNull();
});
it("allows two complete technical timeouts per team under the selected reference", () => {
  let s = createMatch({ ...CONFIG, timeoutSeconds: 1 });
  s = referee(s, "start");
  for (let i = 0; i < 2; i++) {
    s = referee(s, "timeout-blue");
    const clock = s.elapsedTicks;
    s = advance(s, 60);
    expect(s.phase).toBe("running");
    expect(s.elapsedTicks).toBe(clock);
  }
  expect(s.timeouts.blue).toBe(2);
  expect(() => referee(s, "timeout-blue")).toThrow();
  expect(referee(s, "timeout-yellow").phase).toBe("timeout");
});
it("escalates kickoff, free-kick and neutral restart false starts for either side", () => {
  const twice = (s: Match, team: Team) =>
    decideReferee(decideReferee(s, { kind: "false-start", team }), {
      kind: "false-start",
      team,
    });
  let kickoff = twice(createMatch(), "blue");
  expect(kickoff.restart?.team).toBe("yellow");
  expect(kickoff.restart?.kind).toBe("kickoff");
  kickoff = decideReferee(kickoff, { kind: "false-start", team: "blue" });
  expect(kickoff.restart?.kind).toBe("free-kick");
  expect(kickoff.restart?.team).toBe("yellow");
  const defense = twice(createMatch(), "yellow");
  expect(defense.restart?.kind).toBe("kickoff");
  expect(
    defense.robots.filter((r) => r.team === "yellow").every((r) => r.x > 0.4),
  ).toBe(true);
  for (const team of ["blue", "yellow"] as Team[]) {
    const free = decideReferee(running(), {
        kind: "personal-foul",
        team: "yellow",
      }),
      next = twice(free, team);
    expect(next.restart?.kind).toBe(team === "blue" ? "free-kick" : "penalty");
    expect(next.restart?.team).toBe(team === "blue" ? "yellow" : "blue");
  }
  const neutral = twice(
    decideReferee(running(), { kind: "free-ball", team: "blue" }),
    "yellow",
  );
  expect(neutral.restart?.kind).toBe("free-kick");
  expect(neutral.restart?.team).toBe("blue");
  expect(() =>
    decideReferee(running(), { kind: "false-start", team: "blue" }),
  ).toThrow();
});
it("counts opponent interference as participation but ignores teammate and ball-mediated contact", async () => {
  const { automaticReferee } = await import("../src/referee");
  for (const [a, b, ballBetween, penalty] of [
    ["yellow-0", "blue-1", false, true],
    ["blue-1", "yellow-0", false, true],
    ["blue-0", "blue-1", false, false],
    ["yellow-0", "blue-1", true, false],
  ] as const) {
    const s = running();
    park(s);
    place(s, "blue-2", -0.71, -0.2);
    place(s, "blue-1", -0.63, 0.2);
    s.officials.areaTicks["blue-2"] = 20;
    s.ball = { x: -0.7, y: 0, vx: 0, vy: 0 };
    automaticReferee(s, structuredClone(s), {
      ballTouches: [],
      goal: null,
      contacts: [{ a, b, ballBetween, ax: 0, ay: 0, bx: 0, by: 0.1 }],
    });
    expect(s.restart?.kind === "penalty").toBe(penalty);
  }
});
it("handles neutral placement near other robots and missing active restart actors", () => {
  const s = running();
  s.ball = { x: 0.375, y: 0.4, vx: 0, vy: 0 };
  s.robots.forEach((r, i) => {
    r.x = 0.375 + (i % 2 ? -0.1 : 0.1);
    r.y = 0.4;
  });
  const free = decideReferee(s, { kind: "free-ball", team: "blue" });
  expect(
    free.robots.filter((r) => Math.hypot(r.x - 0.375, r.y - 0.4) < 0.19),
  ).toHaveLength(0);
  s.robots.forEach((r) => (r.excludedUntil = 1800));
  const penalty = decideReferee(s, {
    kind: "defensive-overload",
    team: "yellow",
  });
  expect(penalty.restart?.takerId).toBeNull();
  expect(penalty.restart?.keeperId).toBeNull();
});
it("upgrades the original minimal v1 checkpoint without rewriting its data", () => {
  const sample = createMatch(USER_CONFIG),
    config = {
      length: 1.5,
      width: 1.2,
      goalWidth: 0.4,
      halfSeconds: 300,
      intervalSeconds: 600,
      timeoutSeconds: 120,
    };
  const old = {
    version: 1,
    config,
    tick: 77,
    elapsedTicks: 76,
    period: 1,
    phase: "paused",
    phaseTicks: 0,
    score: { blue: 2, yellow: 1 },
    timeouts: { blue: false, yellow: true },
    strategies: sample.strategies,
    ball: sample.ball,
    robots: sample.robots.map(({ id, team, role, x, y, angle }) => ({
      id,
      team,
      role,
      x,
      y,
      angle,
      left: 0.2,
      right: 0.1,
    })),
  };
  const copy = structuredClone(old),
    next = hydrateMatch(old);
  expect(old).toEqual(copy);
  expect(next.tick).toBe(77);
  expect(next.score.blue).toBe(2);
  expect(next.robots[0].targetLeft).toBe(0.2);
  expect(next.robots[0].leftRotation).toBe(0);
  expect(next.config.ruleset).toBe("user-reference");
  expect(next.config.width).toBe(1.2);
  expect(() => hydrateMatch({ ...old, version: 3 })).toThrow();
});
it("distinguishes reversed pushing, keeper protection and balanced contact", async () => {
  const { automaticReferee } = await import("../src/referee");
  for (const [left, right, expected] of [
    [0.3, 0, "yellow"],
    [0, -0.3, "blue"],
    [0.3, -0.3, null],
  ] as const) {
    const s = running();
    park(s);
    const a = place(s, "blue-0", -0.05, 0),
      b = place(s, "yellow-0", 0.05, 0);
    a.left = a.right = left;
    b.left = b.right = right;
    s.ball = { x: 0, y: 0.5, vx: 0, vy: 0 };
    s.officials.pushingTicks = { "blue-0>yellow-0": 17, "yellow-0>blue-0": 17 };
    automaticReferee(s, structuredClone(s), {
      goal: null,
      ballTouches: [],
      contacts: [
        {
          a: a.id,
          b: b.id,
          ax: a.x,
          ay: 0,
          bx: b.x,
          by: 0,
          ballBetween: false,
        },
      ],
    });
    expect(s.phase === "stoppage" ? s.restart?.team : null).toBe(expected);
  }
  const s = running();
  park(s);
  const a = place(s, "blue-0", 0.59, 0),
    keeper = place(s, "yellow-2", 0.7, 0);
  a.left = a.right = 0.3;
  s.ball = { x: 0, y: 0.5, vx: 0, vy: 0 };
  s.officials.pushingTicks["blue-0>yellow-2"] = 17;
  automaticReferee(s, structuredClone(s), {
    goal: null,
    ballTouches: [],
    contacts: [
      {
        a: a.id,
        b: keeper.id,
        ax: a.x,
        ay: 0,
        bx: keeper.x,
        by: 0,
        ballBetween: false,
      },
    ],
  });
  expect(s.restart?.kind).toBe("goal-kick");
  expect(s.restart?.team).toBe("yellow");
});
