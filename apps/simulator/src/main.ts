import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import {
  createMatch,
  referee,
  advance,
  CONFIG,
  USER_CONFIG,
  type Strategy,
} from "@robot-soccer/engine";
const { values } = parseArgs({
  options: {
    blue: { type: "string", default: "koativa" },
    yellow: { type: "string", default: "circuit" },
    half: { type: "string", default: "300" },
    "user-preset": { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
});
const registry: Record<string, Strategy> = {
  koativa: "balanced",
  circuit: "press",
};
if (values.help) {
  console.log(
    "npm run simulate -- --blue koativa --yellow circuit --half 300 [--user-preset]",
  );
  process.exit(0);
}
const blue = registry[values.blue],
  yellow = registry[values.yellow];
if (!blue || !yellow)
  throw new Error("Choose registered example team: koativa or circuit");
let state = createMatch(
    {
      ...(values["user-preset"] ? USER_CONFIG : CONFIG),
      halfSeconds: Number(values.half),
    },
    { blue, yellow },
  ),
  whistles = 0,
  batches = 0;
while (state.phase !== "finished") {
  if (["ready", "stoppage", "paused"].includes(state.phase)) {
    state = referee(state, "start");
    whistles++;
  }
  state = advance(state, 120);
  if (++batches > 20000)
    throw new Error("Match exceeded bounded runner budget");
}
console.log(
  JSON.stringify(
    {
      engine: state.version,
      teams: { blue: values.blue, yellow: values.yellow },
      score: state.score,
      seconds: state.elapsedTicks / 60,
      ticks: state.tick,
      whistles,
      fouls: state.officials.fouls,
      sha256: createHash("sha256").update(JSON.stringify(state)).digest("hex"),
    },
    null,
    2,
  ),
);
