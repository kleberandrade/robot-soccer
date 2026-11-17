import { it, expect, vi } from "vitest";
import { z } from "zod";
import { RoomError } from "../src/room-domain";
import { roomFailure, roomJson } from "../src/room-http";
it("keeps private responses uncached and reports bounded room errors", async () => {
  const response = roomJson({ ok: true });
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  expect(
    roomFailure(new RoomError(403, "Only the host controls the referee."))
      .status,
  ).toBe(403);
  expect(roomFailure(new SyntaxError("bad JSON")).status).toBe(400);
  const error = z.object({ turn: z.number() }).safeParse({ turn: "bad" });
  if (error.success) throw new Error("Invalid fixture");
  expect(roomFailure(error.error).status).toBe(400);
  expect(roomFailure(new Error("Body exceeds 4096 bytes")).status).toBe(400);
});
it("hides internal failures and credential details", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const response = roomFailure(new Error("database secret=not-for-clients"));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("secret");
    expect(log.mock.calls.flat().join(" ")).not.toContain("not-for-clients");
  } finally {
    log.mockRestore();
  }
});
