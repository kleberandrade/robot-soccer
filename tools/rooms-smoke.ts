import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
const base = process.env.BASE_URL ?? "http://127.0.0.1:3107",
  operator = process.env.MATCH_ADMIN_TOKEN;
assert(operator, "MATCH_ADMIN_TOKEN required");
const key = () => randomBytes(32).toString("base64url");
async function call(
  path: string,
  method: string,
  token: string,
  value?: unknown,
) {
  return fetch(base + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: value === undefined ? undefined : JSON.stringify(value),
  });
}
assert.equal(
  (await call("/api/rooms", "POST", "", { name: "Private room test" })).status,
  401,
);
const created = await call("/api/rooms", "POST", operator, {
  name: "Remote competition verification",
});
assert.equal(created.status, 201);
const initial = await created.json(),
  id = initial.room.id,
  path = `/api/rooms/${id}`,
  host = initial.key,
  blue = key(),
  yellow = key();
assert.equal((await call(path, "GET", "")).status, 401);
assert.equal((await fetch(`${base}/api/matches/${id}`)).status, 404);
assert.equal(
  (
    await call("/api/rooms/join", "POST", "", {
      code: initial.invitations.blue,
      key: blue,
      name: "Koativa",
    })
  ).status,
  200,
);
assert.equal(
  (
    await call("/api/rooms/join", "POST", "", {
      code: initial.invitations.blue,
      key: key(),
      name: "Intruder",
    })
  ).status,
  409,
);
assert.equal(
  (
    await call("/api/rooms/join", "POST", "", {
      code: initial.invitations.yellow,
      key: yellow,
      name: "Circuit",
    })
  ).status,
  200,
);
const read = async (token = host) => {
  const r = await call(path, "GET", token);
  assert.equal(r.status, 200);
  return r.json();
};
let room = await read();
assert.equal(room.participants.blue.name, "Koativa");
assert.equal(room.participants.yellow.name, "Circuit");
assert(!JSON.stringify(room).includes(host));
assert(!("pending" in room));
assert(!("host_hash" in room));
assert.equal(
  (
    await call(path, "PATCH", blue, {
      revision: room.revision,
      action: "start",
    })
  ).status,
  403,
);
let changed = await call(path, "PATCH", host, {
  revision: room.revision,
  action: "start",
});
assert.equal(changed.status, 200);
room = await changed.json();
const turn = room.turn;
assert.equal(
  (
    await call(path + "/commands", "POST", blue, {
      turn,
      commands: [{ id: "yellow-0", left: 0, right: 0 }],
    })
  ).status,
  400,
);
assert.equal(
  (
    await call(path + "/commands", "POST", initial.spectatorKey, {
      turn,
      commands: [],
    })
  ).status,
  403,
);
changed = await call(path + "/commands", "POST", blue, {
  turn,
  commands: [{ id: "blue-0", left: 0.3, right: 0.3 }],
});
assert.equal(changed.status, 200);
const waiting = await changed.json();
assert.equal(waiting.match.tick, 0);
assert.deepEqual(waiting.waitingFor, ["yellow"]);
changed = await call(path + "/commands", "POST", yellow, {
  turn,
  commands: [{ id: "yellow-0", left: 0.3, right: 0.3 }],
});
assert.equal(changed.status, 200);
room = await changed.json();
assert.equal(room.match.tick, 6);
assert.equal(room.turn, turn + 1);
assert.equal(
  (await call(path + "/commands", "POST", blue, { turn, commands: [] })).status,
  409,
);
const results = await Promise.all([
  call(path + "/commands", "POST", blue, { turn: room.turn, commands: [] }),
  call(path + "/commands", "POST", yellow, { turn: room.turn, commands: [] }),
]);
assert.deepEqual(
  results.map((r) => r.status),
  [200, 200],
);
room = await read();
assert.equal(room.match.tick, 12);
changed = await call(path, "PATCH", host, {
  revision: room.revision,
  action: "pause",
});
assert.equal(changed.status, 200);
assert.equal(
  (
    await call(path + "/commands", "POST", blue, {
      turn: room.turn,
      commands: [],
    })
  ).status,
  409,
);
assert.equal((await read(initial.spectatorKey)).role, "spectator");
console.log(
  JSON.stringify({
    base,
    roomId: id,
    privateReads: "401 verified",
    teamOwnership: "400/403 verified",
    claimedTeam: "409 verified",
    simultaneousWriters: "both merged, one shared turn",
    playingTicks: 12,
    phase: "paused",
  }),
);
