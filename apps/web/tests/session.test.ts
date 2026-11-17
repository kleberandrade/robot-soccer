import { afterEach, it, expect, vi } from "vitest";
import { MatchSession } from "../src/session";
import { createMatch, referee, advance, CONFIG } from "@robot-soccer/engine";
const callbacks = () => ({
  show: vi.fn(),
  row: vi.fn(),
  message: vi.fn(),
  busy: vi.fn(),
  resetTrail: vi.fn(),
});
afterEach(() => vi.unstubAllGlobals());
it("runs, pauses and resets a local preview without using the network", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const c = callbacks(),
    session = new MatchSession(c);
  await session.action("start");
  await session.tick();
  expect(session.state.elapsedTicks).toBe(6);
  await session.action("pause");
  await session.tick();
  expect(session.state.elapsedTicks).toBe(6);
  session.preview(CONFIG, { blue: "press", yellow: "balanced" });
  expect(session.state.phase).toBe("ready");
  expect(c.row).toHaveBeenLastCalledWith(null);
  expect(fetch).not.toHaveBeenCalled();
  session.close();
  await session.tick();
  expect(session.state.elapsedTicks).toBe(0);
});
it("advances on the server, plays returned frames, and never submits client state", async () => {
  const state = referee(createMatch(), "start"),
    next = advance(state, 6),
    c = callbacks();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ id: "test-id", revision: 1, state }))
    .mockResolvedValueOnce(
      Response.json({
        id: "test-id",
        revision: 2,
        state: next,
        frames: [next],
      }),
    );
  vi.stubGlobal("fetch", fetch);
  const session = new MatchSession(c);
  session.token = "test-secret";
  await session.connect(
    CONFIG,
    { blue: "balanced", yellow: "press" },
    "test-id",
  );
  await session.tick();
  await session.tick();
  expect(fetch).toHaveBeenCalledTimes(2);
  const request = fetch.mock.calls[1][1];
  expect(JSON.parse(request.body)).toEqual({
    revision: 1,
    action: "advance",
    ticks: 120,
  });
  expect(request.headers.Authorization).toBe("Bearer test-secret");
  expect(c.show).toHaveBeenLastCalledWith(next);
});
it("reports a failed connection and preserves the usable preview", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ error: "Persistence unavailable" }, { status: 503 }),
      ),
  );
  const c = callbacks(),
    session = new MatchSession(c);
  await session.connect(CONFIG, { blue: "balanced", yellow: "press" });
  expect(session.server).toBe(null);
  expect(c.message).toHaveBeenLastCalledWith("Persistence unavailable");
  expect(c.busy).toHaveBeenLastCalledWith(false);
});
