import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
const base = process.env.BASE_URL ?? "http://127.0.0.1:3107",
  operator = process.env.MATCH_ADMIN_TOKEN;
assert(operator, "MATCH_ADMIN_TOKEN required");
async function call(path: string, token: string, body: unknown) {
  const r = await fetch(base + path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  assert(r.ok, `Request failed: ${r.status}`);
  return r.json();
}
const created = await call("/api/rooms", operator, {
    name: "Two local code clients",
  }),
  id = created.room.id,
  path = `/api/rooms/${id}`,
  keys = {
    blue: randomBytes(32).toString("base64url"),
    yellow: randomBytes(32).toString("base64url"),
  };
for (const team of ["blue", "yellow"] as const)
  await call("/api/rooms/join", "", {
    code: created.invitations[team],
    name: team === "blue" ? "Koativa" : "Circuit",
    key: keys[team],
  });
const headers = {
    Authorization: `Bearer ${created.key}`,
    "Content-Type": "application/json",
  },
  room = await (await fetch(base + path, { headers })).json();
assert.equal(
  (
    await fetch(base + path, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ revision: room.revision, action: "start" }),
    })
  ).status,
  200,
);
function run(team: "blue" | "yellow", policy: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(
        process.execPath,
        ["--import", "tsx", "examples/remote-team.ts", policy, "--turns", "20"],
        {
          env: {
            ...process.env,
            BASE_URL: base,
            ROOM_ID: id,
            ROOM_KEY: keys[team],
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      ),
      timer = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error("Remote client timed out."));
      }, 45000);
    let output = "";
    child.stdout.on("data", (chunk) => (output += String(chunk)));
    child.stderr.on("data", (chunk) => (output += String(chunk)));
    child.once("error", reject);
    child.once("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 || !output.includes("20 accepted submissions"))
        reject(new Error(`Client ${team} failed: ${output}`));
      else resolve();
    });
  });
}
await Promise.all([run("blue", "koativa"), run("yellow", "circuit")]);
const saved = await (await fetch(base + path, { headers })).json();
assert.equal(saved.match.elapsedTicks, 120);
assert.equal(saved.turn, 21);
assert.deepEqual(saved.waitingFor, ["blue", "yellow"]);
assert.equal(
  (
    await fetch(base + path, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ revision: saved.revision, action: "pause" }),
    })
  ).status,
  200,
);
console.log(
  JSON.stringify({
    base,
    roomId: id,
    clients: ["Koativa", "Circuit"],
    acceptedTurnsPerClient: 20,
    playingTicks: 120,
    phase: "paused",
  }),
);
