import { it, expect } from "vitest";
import { createMatch, referee, step, CONFIG, USER_CONFIG } from "../src/engine";
it("accelerates actual wheel speeds gradually and integrates wheel rotation from traveled distance", () => {
  let s = referee(createMatch({ ...CONFIG, automaticReferee: false }), "start");
  s.ball.y = 0.5;
  const x = s.robots[0].x;
  s = step(s, [{ id: "blue-0", left: 0.3, right: 0.3 }]);
  expect(s.robots[0].targetLeft).toBe(0.3);
  expect(s.robots[0].left).toBeCloseTo(0.05, 12);
  expect(s.robots[0].x - x).toBeCloseTo(0.05 / 60, 12);
  expect(s.robots[0].leftRotation).toBeCloseTo(0.05 / 60 / 0.016, 12);
  const phase = s.robots[0].leftRotation;
  s = step(s, [{ id: "blue-0", left: -0.3, right: -0.3 }]);
  expect(s.robots[0].left).toBeCloseTo(0, 12);
  expect(s.robots[0].leftRotation).toBeCloseTo(phase, 12);
});
it("uses configured axle separation for turns and opposite wheel phases without lateral drive", () => {
  const initial = referee(
      createMatch({ ...USER_CONFIG, wheelBase: 0.05 }),
      "start",
    ),
    r = initial.robots[0];
  const next = step(initial, [{ id: r.id, left: -0.3, right: 0.3 }]).robots[0];
  expect(next.x).toBe(r.x);
  expect(next.y).toBe(r.y);
  expect(next.angle).toBeCloseTo(0.2, 12);
  expect(next.leftRotation).toBeCloseTo(-0.3 / 60 / 0.016, 12);
  expect(next.rightRotation).toBeCloseTo(0.3 / 60 / 0.016, 12);
});
it("rejects a wheel track outside the body and bare robots larger than the VSSS envelope", () => {
  expect(() =>
    createMatch({ ...CONFIG, robotSide: 0.07, wheelBase: 0.07 }),
  ).toThrow();
  expect(() => createMatch({ ...CONFIG, robotSide: 0.08 })).toThrow();
  expect(
    createMatch({ ...CONFIG, ruleset: "custom", robotSide: 0.08 }).config
      .robotSide,
  ).toBe(0.08);
});
it("freezes displayed wheel phases after a referee stop and preserves them across replay", () => {
  let s = step(referee(createMatch(), "start"), [
    { id: "blue-0", left: 0.3, right: 0.3 },
  ]);
  s = referee(s, "pause");
  const phase = s.robots[0].leftRotation;
  expect(step(s, []).robots[0].leftRotation).toBe(phase);
  expect(JSON.parse(JSON.stringify(s)).robots[0].leftRotation).toBe(phase);
});

it("rejects wheels taller than the configured robot", () => {
  expect(() =>
    createMatch({ ...CONFIG, robotHeight: 0.035, wheelRadius: 0.025 }),
  ).toThrow();
});
