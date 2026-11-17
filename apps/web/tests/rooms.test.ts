import { it, expect } from "vitest";
import {
  newRoomState,
  joinParticipant,
  roomAction,
  submitTurn,
  RoomError,
  roomDecision,
} from "../src/room-domain";
function joined() {
  let r = newRoomState("Remote test");
  r = joinParticipant(r, "blue", "Koativa", 0);
  return joinParticipant(r, "yellow", "Circuit", 0);
}
it("keeps a private room stopped until both teams have joined", () => {
  const r = newRoomState("Private match");
  expect(r.version).toBe(1);
  expect(r.turn).toBe(0);
  expect(() => roomAction(r, "start")).toThrow();
  expect(roomAction(joined(), "start").match.phase).toBe("running");
  expect(r.match.phase).toBe("ready");
});
it("advances exactly one common turn only after both teams submit", () => {
  const initial = roomAction(joined(), "start"),
    turn = initial.turn;
  const a = submitTurn(
    initial,
    "blue",
    turn,
    [{ id: "blue-0", left: 0.3, right: 0.3 }],
    100,
  );
  expect(a.match.tick).toBe(0);
  expect(a.pending.yellow).toBeNull();
  expect(initial.pending.blue).toBeNull();
  const b = submitTurn(
    a,
    "yellow",
    turn,
    [{ id: "yellow-0", left: 0.2, right: 0.2 }],
    200,
  );
  expect(b.match.tick).toBe(6);
  expect(b.turn).toBe(turn + 1);
  expect(b.pending).toEqual({ blue: null, yellow: null });
  expect(b.match.robots[0].leftRotation).not.toBe(0);
});
it("rejects opponent commands, duplicates, invalid values and stale turns without advancing", () => {
  const r = roomAction(joined(), "start");
  expect(() =>
    submitTurn(r, "blue", r.turn, [{ id: "yellow-0", left: 0, right: 0 }], 0),
  ).toThrow();
  expect(() =>
    submitTurn(r, "blue", r.turn, [{ id: "blue-0", left: 1, right: 0 }], 0),
  ).toThrow();
  expect(() => submitTurn(r, "blue", r.turn - 1, [], 0)).toThrow(RoomError);
  const sent = submitTurn(r, "blue", r.turn, [], 0);
  expect(() => submitTurn(sent, "blue", r.turn, [], 0)).toThrow(RoomError);
  expect(sent.match.tick).toBe(0);
});
it("invalidates pending commands when the host pauses or makes a referee decision", () => {
  let r = roomAction(joined(), "start");
  const old = r.turn;
  r = submitTurn(r, "blue", old, [{ id: "blue-0", left: 0.3, right: 0.3 }], 0);
  r = roomAction(r, "pause");
  expect(r.pending).toEqual({ blue: null, yellow: null });
  expect(() => submitTurn(r, "yellow", old, [], 0)).toThrow();
  r = roomDecision(r, { kind: "defensive-overload", team: "yellow" });
  expect(r.match.restart?.kind).toBe("penalty");
  expect(r.match.phase).toBe("stoppage");
  expect(() => submitTurn(r, "blue", r.turn, [], 0)).toThrow();
});
it("keeps the host interval clock separate from participant wheel turns", () => {
  let r = roomAction(joined(), "start");
  r.match.config.timeoutSeconds = 1;
  r = roomAction(r, "timeout-blue");
  expect(() => submitTurn(r, "blue", r.turn, [], 0)).toThrow();
  r = roomAction(r, "clock");
  expect(r.match.phase).toBe("running");
  expect(r.match.elapsedTicks).toBe(0);
  expect(r.match.tick).toBe(60);
});
it("requires the missing second participant and restricts host clock advancement to non-playing time", () => {
  const one = joinParticipant(newRoomState("One team"), "blue", "Koativa", 0);
  expect(() => roomAction(one, "start")).toThrow();
  expect(() => roomAction(roomAction(joined(), "start"), "clock")).toThrow();
});
it("rejects a future turn instead of allowing a participant to skip ahead", () => {
  const r = roomAction(joined(), "start");
  expect(() => submitTurn(r, "blue", r.turn + 1, [], 0)).toThrow();
  expect(r.match.tick).toBe(0);
});
