import assert from "node:assert/strict";
const base = process.env.BASE_URL ?? "http://127.0.0.1:3107";
const token = process.env.MATCH_ADMIN_TOKEN;
assert(token, "MATCH_ADMIN_TOKEN required");
const auth = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
const create = await fetch(`${base}/api/matches`, {
  method: "POST",
  headers: auth,
  body: "{}",
});
assert.equal(create.status, 201);
const row = await create.json();
const url = `${base}/api/matches/${row.id}`;
assert.equal(
  (
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
  ).status,
  401,
);
let response = await fetch(url, {
  method: "PATCH",
  headers: auth,
  body: JSON.stringify({ revision: 0, action: "start" }),
});
assert.equal(response.status, 200);
const concurrent = await Promise.all(
  [1, 2].map(() =>
    fetch(url, {
      method: "PATCH",
      headers: auth,
      body: JSON.stringify({ revision: 1, action: "advance", ticks: 120 }),
    }),
  ),
);
assert.deepEqual(concurrent.map((r) => r.status).sort(), [200, 409]);
response = await fetch(url);
const saved = await response.json();
assert.equal(saved.state.elapsedTicks, 120);
assert.equal(saved.revision, 2);
const replay = await (await fetch(`${url}/replay`)).json();
assert.equal(replay.chunks.length, 2);
assert.equal(replay.chunks[1].frames.length, 20);
console.log(
  JSON.stringify({
    base,
    matchId: row.id,
    revision: saved.revision,
    persistedTicks: saved.state.elapsedTicks,
    replayChunks: replay.chunks.length,
    concurrentWriter: "409 rejected",
  }),
);
