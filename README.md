# ROBOT-SOCCER

[![CI](https://github.com/kleberandrade/robot-soccer/actions/workflows/ci.yml/badge.svg)](https://github.com/kleberandrade/robot-soccer/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-App_Router-black)
![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-EF4444)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599)
![ESP32](https://img.shields.io/badge/ESP32-C3-00979D)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An autonomous 3×3 Very Small Size Soccer laboratory: deterministic simulation, a real 3D Next.js viewer, bounded server execution, PostgreSQL checkpoints, two example strategies, and an ESP32 radio/drive reference. This is an experimental platform, not a certified competition system.

[Open the live laboratory](https://robot-soccer.vercel.app) · [Read the learning articles](https://robot-soccer.vercel.app/docs)

![Synchronized 3D and overhead camera laboratory](docs/assets/match-lab-v2.jpg)

## Run locally

Use Node.js 22 or newer and npm (the exact package-manager version is recorded in `package.json`).

```sh
npm ci
npm run dev
# http://127.0.0.1:3107 — usable local preview without credentials
npm test
npm run typecheck
npm run build
npm run simulate -- --blue koativa --yellow circuit --half 10
npm run test:firmware
```

The root commands use **Turborepo** to schedule workspace tasks. `apps/web` is the Next.js App Router application; `apps/simulator` is the reproducible terminal runner; `apps/bridge` is the team computer's UDP adapter. Shared packages are `packages/engine`, `packages/protocol`, and `packages/database`. `firmware` and `hardware` hold the embedded build and electrical/mechanical reference. There is one npm lockfile.

## Persistent server matches

The preview is explicitly local and unsaved. The actual simulation server lives in the Next.js API and executes at most 120 fixed ticks (two simulated seconds) per request. It saves a checkpoint and sampled frames atomically. The browser displays the returned states; it never uploads authoritative match state or wheel commands to that server.

```sh
docker compose -p robot-soccer up -d --wait
# Create apps/web/.env.local using .env.example.
# Local DATABASE_URL:
# postgresql://soccer:local-development-only@127.0.0.1:54329/soccer
# MATCH_ADMIN_TOKEN: generate at least 32 random characters, keep it private.
DATABASE_URL=postgresql://soccer:local-development-only@127.0.0.1:54329/soccer npm run db:migrate
DATABASE_URL=postgresql://soccer:local-development-only@127.0.0.1:54329/soccer npm test
npm run dev
```

Open **Dimensions, teams & connection**, enter the server operator token, select the two registered strategies, and create a server match. Use **Start match** at the referee desk. The token stays only in browser memory. Keep one operator tab open to request simulation batches. Closing all operator clients stops advancement; background tabs may be throttled. Spectators use the match UUID and read saved state. Simulated time follows computed ticks, not wall time: network latency and playback introduce delay. This is live computation, not a prerecorded demo or a permanent hosted process.

`npm run db:migrate` applies versioned schema files and an idempotent team seed. It requires `DATABASE_URL` in its process environment; Next.js's `.env.local` file is not implicitly loaded by command-line tools. For a local smoke test, use `node --env-file=apps/web/.env.local --import tsx tools/smoke.ts` while the dev server runs. It creates one test match, verifies concurrent update rejection, and leaves that match available to inspect.

## Hosting

The chosen stack is **Next.js + Vercel + Neon PostgreSQL**. Import this repository into Vercel with Root Directory **apps/web**, Next.js preset, and access to files outside the root (shared workspaces). The build is `npm run build` within that workspace. Provision a **dedicated** free Neon project, put its pooled URL in server-only `DATABASE_URL`, set a random `MATCH_ADMIN_TOKEN` in encrypted Vercel environment storage, run migrations against that database, and deploy. Never put either value in `NEXT_PUBLIC_*`, the browser bundle, Git, or build logs. Production rejects non-Neon database hosts.

Do not run migrations during each request or preview build. Do not reuse another application's database. No upgrade, paid capacity, or other project's resources are required by this implementation. Actual account/deployment verification is recorded in [the work log](docs/WORK_LOG.md); a stack badge is not a claim that a deployment or database has been provisioned.

## Learn by doing

Start with [Your first match and two example teams](docs/articles/first-match.md), then explore [Differential drive](docs/articles/differential-drive.md), [Fouls and restarts](docs/articles/referee-and-restarts.md), and [Camera, markers and scale](docs/articles/camera-and-markers.md). The same original articles are available in the [web documentation](https://robot-soccer.vercel.app/docs), with exercises, units, worked calculations, source links and code you can run.

**Koativa** (`packages/engine/src/teams/koativa.ts`) uses a striker, screening defender and keeper. **Circuit** (`packages/engine/src/teams/circuit.ts`) adds a supporting attacker. Both are editable TypeScript examples; their stable registered IDs are `balanced` and `press`. They are teaching strategies, without a claim of association with a real competing team.

```sh
npm run simulate -- --blue koativa --yellow circuit --half 10
npm run simulate -- --blue circuit --yellow koativa --half 10
```

The runner acknowledges referee stoppages automatically; the web interface waits for **Whistle / resume**. Compare a controlled change with the same configuration and engine version.

## What's implemented

- Six two-wheel robots, acceleration-limited differential drive, configurable body/axle/wheel dimensions and wheel rotation integrated from traveled distance. Stops freeze the authoritative wheel phases.
- Simultaneous 3D inspection and a synthetic 2D pinhole camera image of the same frame. Configure camera height, tilt, yaw and FOV; inspect its rig/frustum in 3D. Metric roof markers encode team and robot identity.
- The selected organizer-linked VSSS reference preset: 1.50 × 1.30 m black field, chamfers, goal pockets, goal-area ellipses, restart marks, two 300 s halves, 480 s interval and two 180 s technical timeouts per team. The original user-reference preset remains separate.
- Automatic participation/area infractions, sustained pushing, keeper retention and contested stalemates; manual referee decisions; penalties, free kicks, goal kicks, free balls and kickoffs. Stopped restarts await a whistle. Repeated false starts have warnings, escalation and penalty-keeper cautions/exclusion.
- Independent observations, bounded commands, trusted Koativa/Circuit strategies, a deterministic terminal runner and replay checkpoints. PostgreSQL mutations require an operator token and revision check.
- ESP32-C3 firmware reference, authenticated UDP commands, monotonic sequences, expiry/disconnect shutdown, dry-run bridge and native parser tests.

## Rules and practical limits

The user selected the PDF linked by the **official LARC 2026 organizer**. Its filename contains 2025, while its cover identifies Série A 2023; [the rules note](docs/RULES.md) records the exact provenance. This is the selected implementation reference, without a claim of 2026 homologation.

Robot contacts use conservative circles around square bodies. Motor acceleration, friction and pushing thresholds are illustrative; there is no measured mass/torque/slip model. The two basic strategies can deadlock or finish 0–0. Synthetic camera projection is not real image detection or lens calibration. Restarts use deterministic referee placement, rather than demonstrating the physical autonomous-positioning challenge. Human advantage judgment, tipping/gripping, substitutions, early timeout termination, penalty shootouts and complete tournament management remain outside this implementation.

Only trusted, registered strategies run on the server. There are no arbitrary-code upload, shell or human teleoperation endpoints. A browser bearer token provides a single-operator lab model. Physical motor/radio validation, closed-loop speed/odometry, a manufactured PCB and competition inspection remain separate work.

See [hardware](hardware/README.md), [protocol/API](docs/PROTOCOL.md), [architecture](docs/adr/0001-server-batches.md), [security](docs/SECURITY.md), and [verification/work log](docs/WORK_LOG.md). To exercise real HTTP persistence locally, run `node --env-file=apps/web/.env.local --import tsx tools/referee-smoke.ts` with the local server and database running.

## Credits and license

Originated as **Time Fatec Americana — Futebol de Robô (Very Small Size)**. **Kléber de Oliveira Andrade — advisor/orientador.** The original project described Unity 2018.2.7, C# and Arduino; no Unity simulator source was present in the source repository. Its README is preserved verbatim in [docs/legacy/README.md](docs/legacy/README.md).

Preserved notices: **Copyright 2018 Fatec Americana** (original README) and **Copyright (c) 2018 Kléber de Oliveira Andrade** ([LICENSE](LICENSE)). Original repository material and new project source are MIT where rights permit. Dependency packages and linked datasheets retain their respective authorship and licenses; no rights to third-party hardware documentation are asserted.
