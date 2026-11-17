import { it, expect, vi } from "vitest";
import { PrivateRoomSession } from "../src/room-session";
import { createMatch } from "@robot-soccer/engine";
import type { PublicRoom } from "../src/room-client-types";
const callbacks = () => ({
  room: vi.fn(),
  connection: vi.fn(),
  invitations: vi.fn(),
  message: vi.fn(),
  busy: vi.fn(),
});
function room(id: string, role: PublicRoom["role"] = "blue"): PublicRoom {
  return {
    id,
    revision: 0,
    expiresAt: "2026-12-01T00:00:00Z",
    name: "Session fixture",
    turn: 0,
    match: createMatch(),
    participants: { blue: null, yellow: null },
    waitingFor: ["blue", "yellow"],
    role,
  };
}
it("ignores a slow response from an old connection after switching rooms", async () => {
  const cb = callbacks(),
    a = room("a"),
    b = room("b");
  let finish!: (r: Response) => void;
  const transport = vi
    .fn()
    .mockResolvedValueOnce(Response.json(a))
    .mockImplementationOnce(() => new Promise<Response>((r) => (finish = r)))
    .mockResolvedValueOnce(Response.json(b));
  const s = new PrivateRoomSession(cb, transport);
  await s.connect({ id: "a", key: "old" });
  const pending = s.poll();
  await s.connect({ id: "b", key: "new" });
  finish(Response.json({ ...a, revision: 5 }));
  await pending;
  expect(cb.room.mock.calls.at(-1)?.[0].id).toBe("b");
  expect(cb.room).toHaveBeenCalledTimes(2);
});
it("reuses the participant key when an interrupted join is retried", async () => {
  const cb = callbacks(),
    transport = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network interrupted"))
      .mockResolvedValueOnce(Response.json({ room: room("private") })),
    factory = vi.fn(() => "C".repeat(43)),
    s = new PrivateRoomSession(cb, transport, factory);
  await s.join("INVITATION", "Koativa");
  await s.join("INVITATION", "Koativa");
  expect(factory).toHaveBeenCalledTimes(1);
  const bodies = transport.mock.calls.map((c) => JSON.parse(c[1].body));
  expect(bodies[0].key).toBe(bodies[1].key);
  expect(cb.connection).toHaveBeenLastCalledWith({
    id: "private",
    key: "C".repeat(43),
  });
});
it("does not publish a late response after the page closes", async () => {
  const cb = callbacks();
  let finish!: (r: Response) => void;
  const s = new PrivateRoomSession(
    cb,
    vi.fn(() => new Promise<Response>((r) => (finish = r))),
  );
  const pending = s.connect({ id: "a", key: "private" });
  s.close();
  finish(Response.json(room("a")));
  await pending;
  expect(cb.room).not.toHaveBeenCalled();
});
it("advances only the host interval clock through a referee request", async () => {
  const cb = callbacks(),
    initial = room("a", "host");
  initial.match.phase = "timeout";
  const completed = {
      ...initial,
      revision: 1,
      match: { ...initial.match, phase: "running" as const },
    },
    transport = vi
      .fn()
      .mockResolvedValueOnce(Response.json(initial))
      .mockResolvedValueOnce(Response.json(initial))
      .mockResolvedValueOnce(Response.json(completed));
  const s = new PrivateRoomSession(cb, transport);
  await s.connect({ id: "a", key: "private" });
  await s.poll();
  expect(JSON.parse(transport.mock.calls[2][1].body).action).toBe("clock");
  expect(cb.room.mock.calls.at(-1)?.[0].match.phase).toBe("running");
});
it("invokes the browser fetch without binding it to the session instance", async () => {
  const cb = callbacks();
  vi.stubGlobal("fetch", function (this: unknown) {
    if (this instanceof PrivateRoomSession)
      throw new TypeError("Illegal invocation");
    return Promise.resolve(Response.json(room("browser")));
  });
  try {
    const s = new PrivateRoomSession(cb);
    await s.connect({ id: "browser", key: "private" });
    expect(cb.room).toHaveBeenCalledTimes(1);
  } finally {
    vi.unstubAllGlobals();
  }
});
it("does not poll without a connection or after the page closes", async () => {
  const cb = callbacks(),
    transport = vi.fn().mockResolvedValue(Response.json(room("a"))),
    s = new PrivateRoomSession(cb, transport);
  await s.poll();
  expect(transport).not.toHaveBeenCalled();
  await s.connect({ id: "a", key: "private" });
  s.close();
  await s.poll();
  expect(transport).toHaveBeenCalledTimes(1);
});
it("reports a lost network connection while preserving the last official checkpoint", async () => {
  const cb = callbacks(),
    transport = vi
      .fn()
      .mockResolvedValueOnce(Response.json(room("a")))
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockRejectedValueOnce("Offline"),
    s = new PrivateRoomSession(cb, transport);
  await s.connect({ id: "a", key: "private" });
  await s.poll();
  expect(cb.message).toHaveBeenLastCalledWith("Network unavailable");
  await s.poll();
  expect(cb.message).toHaveBeenLastCalledWith("Room connection lost.");
  expect(cb.room).toHaveBeenCalledTimes(1);
});
it("ignores a late polling failure after the page is closed", async () => {
  const cb = callbacks();
  let fail!: (error: Error) => void;
  const transport = vi
      .fn()
      .mockResolvedValueOnce(Response.json(room("a")))
      .mockImplementationOnce(
        () => new Promise<Response>((_, reject) => (fail = reject)),
      ),
    s = new PrivateRoomSession(cb, transport);
  await s.connect({ id: "a", key: "private" });
  cb.message.mockClear();
  const pending = s.poll();
  s.close();
  fail(new Error("Late network error"));
  await pending;
  expect(cb.message).not.toHaveBeenCalled();
});
