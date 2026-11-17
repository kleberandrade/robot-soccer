import assert from "node:assert/strict";
const base = process.env.BASE_URL ?? "http://127.0.0.1:3107",
  token = process.env.MATCH_ADMIN_TOKEN;
assert(token, "MATCH_ADMIN_TOKEN required");
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
const created = await fetch(`${base}/api/matches`, {
  method: "POST",
  headers,
  body: "{}",
});
assert.equal(created.status, 201);
const row = await created.json(),
  url = `${base}/api/matches/${row.id}`;
assert.equal(row.state.version, 2);
const decision = { kind: "defensive-overload", team: "yellow" };
assert.equal(
  (
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revision: 0, action: "decision", decision }),
    })
  ).status,
  401,
);
async function update(revision: number, action: string, extra: object = {}) {
  const r = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ revision, action, ...extra }),
  });
  assert.equal(r.status, 200);
  return r.json();
}
const stopped = await update(0, "decision", { decision });
assert.equal(stopped.state.restart.kind, "penalty");
assert.equal(stopped.state.restart.team, "blue");
assert.equal(stopped.state.officials.fouls.yellow, 1);
assert.equal(stopped.state.ball.x, 0.375);
const frozen = await update(1, "advance", { ticks: 120 });
assert.equal(frozen.state.tick, 0);
assert.equal(frozen.frames.length, 0);
await update(2, "start");
const moving = await update(3, "advance", { ticks: 12 });
assert.equal(moving.state.elapsedTicks, 12);
assert(
  moving.state.robots.some(
    (r: { leftRotation: number }) => r.leftRotation !== 0,
  ),
);
const saved = await (await fetch(url)).json();
assert.deepEqual(saved.state, moving.state);
const replay = await (await fetch(`${url}/replay`)).json();
assert.equal(replay.chunks.length, 4);
assert.equal(replay.chunks[0].checkpoint.restart.kind, "penalty");
await update(4, "pause");
console.log(
  JSON.stringify({
    base,
    matchId: row.id,
    engine: saved.state.version,
    referee: "penalty persisted, frozen until whistle",
    wheelTravel: "integrated",
    authentication: "401 verified",
    replayChunks: replay.chunks.length,
  }),
);
