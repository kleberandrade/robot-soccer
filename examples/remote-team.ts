/** Run trusted team code locally; only observations and wheel commands cross the network. */
import { parseArgs } from "node:util";
import { setTimeout as delay } from "node:timers/promises";
import {
  observe,
  parseCommands,
  type Team,
  type Match,
} from "@robot-soccer/engine";
import { koativa, circuit } from "@robot-soccer/engine/teams";
const args = parseArgs({
    allowPositionals: true,
    options: {
      turns: { type: "string" },
      help: { type: "boolean", default: false },
    },
  }),
  policy = args.positionals[0] ?? "koativa";
if (args.values.help) {
  console.log(
    "node --env-file=.env.room-blue --import tsx examples/remote-team.ts koativa|circuit [--turns 20]",
  );
  process.exit(0);
}
if (!["koativa", "circuit"].includes(policy))
  throw new Error("Choose koativa or circuit.");
const base = process.env.BASE_URL ?? "https://robot-soccer.vercel.app",
  id = process.env.ROOM_ID,
  key = process.env.ROOM_KEY;
if (!id || !key)
  throw new Error(
    "ROOM_ID and ROOM_KEY are required. Download your team connection from /compete.",
  );
const parsedBase = new URL(base);
if (
  parsedBase.protocol !== "https:" &&
  !["127.0.0.1", "localhost", "::1"].includes(parsedBase.hostname)
)
  throw new Error("Use HTTPS for remote rooms.");
const limit =
  args.values.turns === undefined ? Infinity : Number(args.values.turns);
if (!(limit > 0)) throw new Error("Turn limit must be positive.");
const url = `${base}/api/rooms/${id}`,
  headers = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
let submitted = -1,
  count = 0,
  phase = "";
while (count < limit) {
  try {
    const response = await fetch(url, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      throw new Error(
        `Room access failed (${response.status}). Check the saved connection and expiry.`,
      );
    const room = (await response.json()) as {
      role: string;
      turn: number;
      match: Match;
      waitingFor: Team[];
    };
    if (room.role !== "blue" && room.role !== "yellow")
      throw new Error(
        "This client requires a team key, not a host or spectator key.",
      );
    if (room.match.phase !== phase) {
      phase = room.match.phase;
      console.log(`${room.role} / ${policy}: ${phase}`);
    }
    if (phase === "finished") {
      console.log("Match complete.", room.match.score);
      break;
    }
    if (
      phase === "running" &&
      room.waitingFor.includes(room.role) &&
      room.turn !== submitted
    ) {
      const observation = observe(room.match, room.role),
        commands = parseCommands(
          room.role,
          (policy === "koativa" ? koativa : circuit)(observation),
        );
      const result = await fetch(url + "/commands", {
        method: "POST",
        headers,
        body: JSON.stringify({ turn: room.turn, commands }),
        signal: AbortSignal.timeout(10000),
      });
      if (result.ok) {
        submitted = room.turn;
        count++;
        if (count % 50 === 0) console.log(`${count} turns submitted.`);
      } else if (result.status !== 409)
        throw new Error(`Commands rejected (${result.status}).`);
    }
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Room connection interrupted.",
    );
    if (
      error instanceof Error &&
      /access failed|requires a team/.test(error.message)
    )
      process.exit(1);
    await delay(1000);
  }
  await delay(100);
}
console.log(
  `Client stopped after ${count} accepted submissions. A missing team freezes the next shared turn.`,
);
