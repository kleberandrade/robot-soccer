import { describe, it, expect } from "vitest";
import {
  createMatch,
  referee,
  step,
  advance,
  parseCommands,
  observe,
  DT,
  CONFIG,
} from "../src/engine";
import { autonomous } from "../src/teams";

describe("match rules", () => {
  it("starts safe, pauses, resumes and resets", () => {
    let s = createMatch();
    expect(s.robots).toHaveLength(6);
    expect(step(s, [])).toEqual(s);
    s = referee(s, "start");
    s = advance(s, 60);
    expect(s.elapsedTicks).toBe(60);
    s = referee(s, "pause");
    expect(advance(s, 60)).toEqual(s);
    s = referee(s, "start");
    expect(advance(s, 1).elapsedTicks).toBe(61);
    expect(referee(s, "reset")).toEqual(createMatch());
  });
  it("uses fixed timestep and reproduces identical matches without mutating inputs", () => {
    const initial = referee(createMatch(), "start"),
      copy = structuredClone(initial);
    const a = Array.from({ length: 10 }).reduce<typeof initial>(
        (s) => advance(s, 120),
        initial,
      ),
      b = Array.from({ length: 10 }).reduce<typeof initial>(
        (s) => advance(s, 120),
        initial,
      );
    expect(a).toEqual(b);
    expect(initial).toEqual(copy);
    expect(DT).toBe(1 / 60);
    expect(a.robots.some((r, i) => r.x !== initial.robots[i].x)).toBe(true);
  });
  it("changes ends after a timed interval and finishes after two periods", () => {
    let s = referee(
      createMatch({ ...CONFIG, halfSeconds: 1, intervalSeconds: 1 }),
      "start",
    );
    s = advance(s, 60);
    expect(s.phase).toBe("halftime");
    expect(s.period).toBe(1);
    s = advance(s, 60);
    expect(s.phase).toBe("running");
    expect(s.period).toBe(2);
    s = advance(s, 60);
    expect(s.phase).toBe("finished");
    expect(s.elapsedTicks).toBe(120);
  });
  it("allows one timed timeout per team and freezes match time", () => {
    let s = referee(createMatch({ ...CONFIG, timeoutSeconds: 1 }), "start");
    s = referee(s, "timeout-blue");
    expect(s.phase).toBe("timeout");
    expect(() => referee(s, "start")).toThrow();
    s = advance(s, 60);
    expect(s.phase).toBe("running");
    expect(s.elapsedTicks).toBe(0);
    expect(() => referee(s, "timeout-blue")).toThrow();
  });
  it("scores only inside goal mouth and restarts positions", () => {
    const s = referee(createMatch(), "start");
    s.ball = { x: CONFIG.length / 2 + 0.022, y: 0, vx: 1, vy: 0 };
    const out = step(s, []);
    expect(out.score.blue).toBe(1);
    expect(out.ball.x).toBe(0);
    s.ball = { x: CONFIG.length / 2 - 0.022, y: 0.45, vx: 2, vy: 0 };
    const wall = step(s, []);
    expect(wall.score.blue).toBe(0);
    expect(wall.ball.vx).toBeLessThan(0);
  });
  it("resolves robot contacts and keeps all bodies within bounds", () => {
    let s = referee(createMatch(), "start");
    s.robots[0].x = s.robots[1].x;
    s.robots[0].y = s.robots[1].y;
    s = step(s, []);
    expect(
      Math.hypot(s.robots[0].x - s.robots[1].x, s.robots[0].y - s.robots[1].y),
    ).toBeGreaterThan(0.1);
    for (let i = 0; i < 25; i++) s = advance(s, 120);
    for (const r of s.robots) {
      expect(Math.abs(r.x)).toBeLessThanOrEqual(
        s.config.length / 2 - 0.053 + 1e-8,
      );
      expect(Math.abs(r.y)).toBeLessThanOrEqual(
        s.config.width / 2 - 0.053 + 1e-8,
      );
    }
  });
  it("pushes ball on robot contact and counts opposite goals after changing ends", () => {
    const s = referee(createMatch(), "start");
    const r = s.robots[0];
    s.ball = { x: r.x + 0.06, y: r.y, vx: 0, vy: 0 };
    expect(
      step(s, [{ id: r.id, left: 0.5, right: 0.5 }]).ball.vx,
    ).toBeGreaterThan(0);
    s.period = 2;
    s.ball = { x: -s.config.length / 2 - 0.022, y: 0, vx: -1, vy: 0 };
    expect(step(s, []).score.blue).toBe(1);
  });
});
describe("protocol and autonomy boundaries", () => {
  it("rejects cross-team, duplicate, non-finite and excessive commands", () => {
    for (const payload of [
      [{ id: "yellow-0", left: 0, right: 0 }],
      [{ id: "blue-0", left: NaN, right: 0 }],
      [{ id: "blue-0", left: 2, right: 0 }],
      [
        { id: "blue-0", left: 0, right: 0 },
        { id: "blue-0", left: 0, right: 0 },
      ],
    ])
      expect(() => parseCommands("blue", payload)).toThrow();
    expect(
      parseCommands("blue", [{ id: "blue-0", left: -0.5, right: 0.5 }]),
    ).toHaveLength(1);
  });
  it("gives teams independent observations and bounded role-based commands", () => {
    const s = createMatch();
    const blue = observe(s, "blue");
    blue.state.ball.x = 99;
    expect(s.ball.x).toBe(0);
    expect(observe(s, "yellow").state.ball.x).toBe(0);
    expect(
      parseCommands("blue", autonomous(observe(s, "blue"), "balanced")),
    ).toHaveLength(3);
  });
  it("rejects invalid configs, non-integer batches and batches above two seconds", () => {
    expect(() => createMatch({ ...CONFIG, length: 0 })).toThrow();
    expect(() => advance(createMatch(), 121)).toThrow();
    expect(() => advance(createMatch(), 1.5)).toThrow();
  });
});
describe("physical trajectory regression cases", () => {
  it("places a symmetric zero-velocity kickoff and preserves protocol identity", () => {
    const s = createMatch();
    expect(s.tick).toBe(0);
    expect(s.elapsedTicks).toBe(0);
    expect(s.period).toBe(1);
    expect(s.phaseTicks).toBe(0);
    expect(s.version).toBe(1);
    expect(s.score).toEqual({ blue: 0, yellow: 0 });
    expect(s.timeouts).toEqual({ blue: false, yellow: false });
    expect(s.ball).toEqual({ x: 0, y: 0, vx: 0, vy: 0 });
    for (const [team, sign] of [
      ["blue", 1],
      ["yellow", -1],
    ] as const) {
      const robots = s.robots.filter((r) => r.team === team);
      robots.forEach((r, i) =>
        expect(r.x).toBeCloseTo([-0.24, -0.45, -0.66][i] * sign, 12),
      );
      expect(robots.map((r) => r.y)).toEqual([0, 0.24, 0]);
      for (const r of robots) {
        expect(r.left).toBe(0);
        expect(r.right).toBe(0);
        expect(r.angle).toBe(sign === 1 ? 0 : Math.PI);
      }
    }
    expect(observe(s, "blue").version).toBe(1);
  });
  it("drives straight at the commanded metric velocity and turns in place", () => {
    const s = referee(createMatch(), "start"),
      r = s.robots[0];
    const straight = step(s, [{ id: r.id, left: 0.3, right: 0.3 }]).robots[0];
    expect(straight.x).toBeCloseTo(r.x + 0.005, 12);
    expect(straight.y).toBe(r.y);
    expect(straight.angle).toBe(0);
    expect(straight.left).toBe(0.3);
    expect(straight.right).toBe(0.3);
    const turn = step(s, [{ id: r.id, left: -0.3, right: 0.3 }]).robots[0];
    expect(turn.x).toBe(r.x);
    expect(turn.y).toBe(r.y);
    expect(turn.angle).toBeCloseTo(0.6 / 0.065 / 60, 12);
    const stopped = step(s, []).robots[0];
    expect(stopped.x).toBe(r.x);
    expect(stopped.left).toBe(0);
  });
  it("moves an unobstructed ball and reflects against both side walls", () => {
    const s = referee(createMatch(), "start");
    s.ball = { x: 0.3, y: 0.4, vx: 0.6, vy: 0.3 };
    const moved = step(s, []);
    expect(moved.ball.x).toBeCloseTo(0.31, 12);
    expect(moved.ball.y).toBeCloseTo(0.405, 12);
    expect(moved.ball.vx).toBeCloseTo(0.594, 12);
    expect(moved.ball.vy).toBeCloseTo(0.297, 12);
    for (const sign of [-1, 1]) {
      s.ball = { x: 0, y: sign * 0.579, vx: 0, vy: sign * 0.6 };
      const wall = step(s, []).ball;
      expect(wall.y).toBeCloseTo(sign * (0.6 - 0.02135), 12);
      expect(wall.vy).toBeCloseTo(-sign * 0.6 * 0.99 * 0.75, 12);
    }
  });
  it("bounds differential robots on each wall and tracks technical timeout ownership", () => {
    const s = referee(createMatch(), "start");
    for (const sign of [-1, 1]) {
      s.robots[0].x = sign * 0.697;
      s.robots[0].y = sign * 0.547;
      s.robots[0].angle = sign > 0 ? Math.PI / 4 : (-3 * Math.PI) / 4;
      const r = step(s, [{ id: "blue-0", left: 0.6, right: 0.6 }]).robots[0];
      expect(r.x).toBeCloseTo(sign * 0.697, 12);
      expect(r.y).toBeCloseTo(sign * 0.547, 12);
    }
    const timeout = referee(s, "timeout-yellow");
    expect(timeout.timeouts).toEqual({ blue: false, yellow: true });
    expect(timeout.phaseTicks).toBe(0);
  });
  it("scores each attacking direction and resets ball motion", () => {
    for (const period of [1, 2] as const)
      for (const sign of [-1, 1]) {
        const s = referee(createMatch(), "start");
        s.period = period;
        s.ball = { x: sign * 0.78, y: 0, vx: sign * 0.1, vy: 0 };
        const out = step(s, []);
        expect(out.score).toEqual(
          (period === 1 ? sign > 0 : sign < 0)
            ? { blue: 1, yellow: 0 }
            : { blue: 0, yellow: 1 },
        );
        expect(out.ball).toEqual({ x: 0, y: 0, vx: 0, vy: 0 });
      }
  });
});
describe("collision impulses", () => {
  it("separates two overlapping robots symmetrically without inventing a velocity", () => {
    const s = referee(createMatch(), "start");
    s.robots[0].x = 0;
    s.robots[0].y = 0;
    s.robots[1].x = 0.02;
    s.robots[1].y = 0;
    s.ball.y = 0.5;
    const result = step(s, []);
    expect(result.robots[0].x).toBeCloseTo(-0.043, 12);
    expect(result.robots[1].x).toBeCloseTo(0.063, 12);
    expect(result.robots[0].y).toBe(0);
    expect(result.robots[1].y).toBe(0);
  });
  it("reflects an approaching ball on a stationary robot along the contact normal", () => {
    const s = referee(createMatch(), "start");
    s.robots[0].x = 0;
    s.robots[0].y = 0;
    s.ball = { x: 0, y: 0.05, vx: 0, vy: -0.1 };
    const b = step(s, []).ball;
    expect(b.x).toBe(0);
    expect(b.y).toBeCloseTo(0.07435, 12);
    expect(b.vx).toBe(0);
    expect(b.vy).toBeCloseTo(0.0495, 12);
  });
  it("resolves a zero-distance ball contact without NaN or spurious impulse", () => {
    const s = referee(createMatch(), "start");
    s.robots[0].x = 0;
    s.robots[0].y = 0;
    s.ball = { x: 0, y: 0, vx: 0, vy: 0 };
    const b = step(s, []).ball;
    expect(b).toEqual({ x: 0.07435, y: 0, vx: 0, vy: 0 });
  });
  it("does not bounce a separating ball back into a robot", () => {
    const s = referee(createMatch(), "start");
    s.robots[0].x = 0;
    s.robots[0].y = 0;
    s.ball = { x: 0, y: 0.05, vx: 0, vy: 0.1 };
    expect(step(s, []).ball.vy).toBeCloseTo(0.099, 12);
  });
});
it("clears wheel commands when the referee pauses or calls a timeout", () => {
  const moving = advance(referee(createMatch(), "start"), 6);
  expect(moving.robots.some((r) => r.left !== 0 || r.right !== 0)).toBe(true);
  for (const action of ["pause", "timeout-blue"] as const) {
    const halted = referee(moving, action);
    expect(halted.robots.every((r) => r.left === 0 && r.right === 0)).toBe(
      true,
    );
  }
});
it("reconstructs the same next batch from a serialized checkpoint", () => {
  const initial = advance(referee(createMatch(), "start"), 120);
  const checkpoint = JSON.parse(JSON.stringify(initial));
  expect(advance(checkpoint, 120)).toEqual(advance(initial, 120));
  expect(advance(checkpoint, 120).tick).toBe(240);
});
