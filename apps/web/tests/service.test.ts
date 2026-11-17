import { it, expect, afterEach } from "vitest";
import { authorized, body } from "../src/http";
import { newMatch, UpdateSchema, applyUpdate } from "../src/service";
afterEach(() => {
  delete process.env.MATCH_ADMIN_TOKEN;
});
it("denies missing, short, wrong and Unicode operator tokens without throwing", () => {
  const req = (s: string) =>
    new Request("http://localhost", { headers: { authorization: s } });
  expect(authorized(req("Bearer abc"))).toBe(false);
  process.env.MATCH_ADMIN_TOKEN = "x".repeat(32);
  expect(authorized(req("Bearer " + "x".repeat(32)))).toBe(true);
  expect(authorized(req("Bearer " + "y".repeat(32)))).toBe(false);
  expect(authorized(req("Bearer " + "é".repeat(32)))).toBe(false);
});
it("limits streamed request bodies even without content-length", async () => {
  await expect(
    body(
      new Request("http://localhost", {
        method: "POST",
        body: "x".repeat(4097),
      }),
    ),
  ).rejects.toThrow();
  expect(
    await body(
      new Request("http://localhost", { method: "POST", body: '{"a":1}' }),
    ),
  ).toEqual({ a: 1 });
});
it("creates validated matches, rejects code uploads, and returns bounded live replay frames", () => {
  expect(() => newMatch({ code: "process.exit()" })).toThrow();
  const state = newMatch({});
  const running = applyUpdate(
    state,
    UpdateSchema.parse({ revision: 0, action: "start" }),
  );
  const next = applyUpdate(
    running.state,
    UpdateSchema.parse({ revision: 1, action: "advance", ticks: 120 }),
  );
  expect(next.frames).toHaveLength(20);
  expect(next.state.elapsedTicks).toBe(120);
  expect(next.frames.at(-1)).toEqual(next.state);
  expect(() =>
    UpdateSchema.parse({ revision: -1, action: "advance", ticks: 121 }),
  ).toThrow();
});
it("returns safe client errors and hides database error details", async () => {
  const { failure } = await import("../src/http");
  expect(failure(new Error("Body too big")).status).toBe(400);
  expect(failure(new SyntaxError("Unexpected token")).status).toBe(400);
  const response = failure(new Error("database password=private"));
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private");
});
