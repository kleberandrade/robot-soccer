# Your first match and two example teams

You do not need robots, a camera, or database credentials to start. The local preview uses the same fixed-step engine and registered strategies as server matches. Start here before changing strategy code.

## 1. Start the laboratory

From the monorepo root:

```sh
npm ci
npm run dev
```

Open [the local match lab](http://127.0.0.1:3107/lab). You should see the 3D field and the overhead camera projection **at the same time**. The labels distinguish local preview from a server match saved in Neon.

Press **Start match**. Six autonomous robots begin moving. You can orbit and zoom the 3D scene, change camera height/tilt, and inspect the wheel spokes. These viewing controls do not drive a robot. When a foul stops play, read the restart announcement and press **Whistle / resume**.

A stopped clock during a restart is expected: teams must wait for the referee's signal.

## 2. Run the two supplied teams without a browser

The two examples are real source modules used by the application:

- **Koativa**, `packages/engine/src/teams/koativa.ts`, uses one striker, a screening defender, and a goalkeeper. Its registered strategy ID is `balanced`.
- **Circuit**, `packages/engine/src/teams/circuit.ts`, uses a striker and a supporting attacker that stays outside the goal areas. Its registered strategy ID is `press`.

Both use `packages/engine/src/teams/navigation.ts` to convert a field target into wheel velocities. You can read each policy in a small file instead of tracing the renderer or database.

Run a short match:

```sh
npm run simulate -- --blue koativa --yellow circuit --half 10
```

Swap their colors and run again:

```sh
npm run simulate -- --blue circuit --yellow koativa --half 10
```

The runner advances the engine as fast as possible and acts as a simulated official by whistling after each stopped restart. It reports teams, score, played seconds, fouls, whistle count, and a final state hash. Running identical arguments twice should give the same hash on the same engine/runtime. A draw is a valid result; these are teaching strategies, not tournament-winning policies.

**Do not connect this accelerated runner to physical motors.** It does not maintain real-world radio timing.

## 3. Understand the smallest team turn

This is the common loop used by local trusted code:

```ts
import {
  createMatch,
  observe,
  referee,
  step,
  parseCommands,
} from "@robot-soccer/engine";
import { koativa, circuit } from "@robot-soccer/engine/teams";

let match = referee(createMatch(), "start");

const blueObservation = observe(match, "blue");
const yellowObservation = observe(match, "yellow");
const blueCommands = parseCommands("blue", koativa(blueObservation));
const yellowCommands = parseCommands("yellow", circuit(yellowObservation));

match = step(match, [...blueCommands, ...yellowCommands]);
```

Each observation is an independent copy. Mutating it does not change the authoritative match. A team returns wheel commands only for its own robot IDs. The validator rejects duplicate IDs, another team's robot, non-finite numbers, and speeds outside ±0.6 m/s.

Create a command without running an entire match:

```ts
import { createMatch, observe } from "@robot-soccer/engine";
import { koativa } from "@robot-soccer/engine/teams";

const commands = koativa(observe(createMatch(), "blue"));
console.log(commands);
// Example shape: [{ id: "blue-0", left: ..., right: ... }, ...]
```

The numbers depend on robot pose and target. A command is a desired **linear wheel speed**, not a PWM duty or angle in degrees.

## 4. Make one change you can explain

In Koativa's defender branch, change its midfield screening position from `length * .27` to `length * .23`. Run tests and the same short match again:

```sh
npm test --workspace=@robot-soccer/engine
npm run simulate -- --blue koativa --yellow circuit --half 10
```

Ask three questions: did the defender move closer to midfield, did its own goal area remain clear, and did the foul count change? A different hash alone does not prove the strategy improved. Compare a specific behavior in the two views.

Revert the change or commit it once you understand its effect. Never modify files under `node_modules` to change a team.

## 5. Use the web configuration

Open **Dimensions, teams & connection**. Choose the organizer-linked VSSS reference, the earlier user reference, or a custom training configuration. Pick a strategy independently for blue and yellow, then **Apply to preview**. Creating a server match uses the same selections and requires the private operator token.

Configuration edits apply to a new preview or server match; they do not silently resize a running persisted match. The camera controls are independent viewing settings and can change while a match is paused or running.

## Test checklist

Before sharing a team change, run:

```sh
npm run typecheck
npm test
npm run build
```

Database integration tests need an explicitly configured `DATABASE_URL`; without one, they report a skip. See the repository README for a dedicated local PostgreSQL setup. Unknown team code is never uploaded or executed through the hosted API. These examples are trusted project modules; untrusted competitors need an isolated runner.

## Next experiment

Read [Differential drive](/docs/differential-drive), then deliberately exchange left and right wheel targets in a local copy of the navigator. Predict the turn direction before running it. Restore the correct implementation afterward.
