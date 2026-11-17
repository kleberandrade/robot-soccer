# ROBOT-SOCCER

[![CI](https://github.com/kleberandrade/robot-soccer/actions/workflows/ci.yml/badge.svg)](https://github.com/kleberandrade/robot-soccer/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-App_Router-black)
![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-EF4444)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599)
![ESP32](https://img.shields.io/badge/ESP32-C3-00979D)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An autonomous 3×3 Very Small Size Soccer laboratory: deterministic simulation, a real 3D Next.js viewer, bounded server execution, PostgreSQL checkpoints, two example strategies, and an ESP32 radio/drive reference. This is an experimental platform, not a certified competition system.

![Public 3D match laboratory with a server match persisted in Neon](docs/assets/match-lab.jpg)

## Run locally

Use Node.js 22 or newer and npm (the exact package-manager version is recorded in `package.json`).

```sh
npm ci
npm run dev
# http://127.0.0.1:3107 — usable local preview without credentials
npm test
npm run typecheck
npm run build
npm run simulate
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

Open **Configure & connect**, enter the server operator token, select the two registered strategies, and create a server match. Use **Start match** at the referee desk. The token stays only in browser memory. Keep one operator tab open to request simulation batches. Closing all operator clients stops advancement; background tabs may be throttled. Spectators use the match UUID and read saved state. Simulated time follows computed ticks, not wall time: network latency and playback introduce delay. This is live computation, not a prerecorded demo or a permanent hosted process.

`npm run db:migrate` applies versioned schema files and an idempotent team seed. It requires `DATABASE_URL` in its process environment; Next.js's `.env.local` file is not implicitly loaded by command-line tools. For a local smoke test, use `node --env-file=apps/web/.env.local --import tsx tools/smoke.ts` while the dev server runs. It creates one test match, verifies concurrent update rejection, and leaves that match available to inspect.

## Hosting

The chosen stack is **Next.js + Vercel + Neon PostgreSQL**. Import this repository into Vercel with Root Directory **apps/web**, Next.js preset, and access to files outside the root (shared workspaces). The build is `npm run build` within that workspace. Provision a **dedicated** free Neon project, put its pooled URL in server-only `DATABASE_URL`, set a random `MATCH_ADMIN_TOKEN` in encrypted Vercel environment storage, run migrations against that database, and deploy. Never put either value in `NEXT_PUBLIC_*`, the browser bundle, Git, or build logs. Production rejects non-Neon database hosts.

Do not run migrations during each request or preview build. Do not reuse another application's database. No upgrade, paid capacity, or other project's resources are required by this implementation. Actual account/deployment verification is recorded in [the work log](docs/WORK_LOG.md); a stack badge is not a claim that a deployment or database has been provisioned.

## What's implemented

- Six differential-drive robots with striker, defender and keeper roles, configurable field/timings, a 60 Hz pure simulation step, approximate circular contacts, wall reflection, goals and scores.
- Start, pause, reset, two halves, a timed interval, changed attacking direction, one technical timeout per team under the user-reference preset, and end-of-match state.
- Independent observations, bounded versioned command validation, balanced and high-press registered strategies, deterministic terminal runner and checkpoint replay chunks.
- A proportional Three.js/R3F field, camera orbit/zoom, robot IDs, ball trail, lineup/command display, match/connection status, responsive layout, keyboard controls and useful 2D WebGL fallback.
- PostgreSQL schema, idempotent migration/seed, authenticated mutations and atomic optimistic revision checks. Replay reads are paginated (20 chunks).
- ESP32-C3 firmware build, HMAC-authenticated UDP commands, monotonic sequence validation, safe initial state, stop-on-expiry/disconnect, dry-run bridge, and native parser tests.

## Limits and next steps

Physics uses circles around 75 mm robot boxes and is an approximation, not a rigid-body solver. Friction and open-loop motor conversion are illustrative and uncalibrated. Strategies are intentionally basic and can deadlock around the ball; a 0–0 match is possible. Fouls, penalties, substitutions, corner chamfers, tournament management and full referee-box compatibility are not implemented. The visual field is a readable lab rendering, not the black official surface.

Only built-in, trusted strategies run on the server. There are no code-upload, shell-execution, remote plugin or human teleoperation endpoints. An OS/container isolation boundary, resource limits and a reviewed protocol are required before supporting untrusted team programs. A browser bearer token is a single-operator lab model, not multi-user identity or production tournament authorization.

No real camera pipeline, closed-loop speed control, encoder odometry, manufactured PCB, physical motor/radio testing or competition homologation is claimed. The electronics include a dimensioned design proposal and explicit component-selection gates, not fabrication-ready CAD. See [hardware](hardware/README.md), [protocol/API](docs/PROTOCOL.md), [architecture decisions](docs/adr/0001-server-batches.md), [rules reference](docs/RULES.md), [security](docs/SECURITY.md), and [verification/work log](docs/WORK_LOG.md).

## Credits and license

Originated as **Time Fatec Americana — Futebol de Robô (Very Small Size)**. **Kléber de Oliveira Andrade — advisor/orientador.** The original project described Unity 2018.2.7, C# and Arduino; no Unity simulator source was present in the source repository. Its README is preserved verbatim in [docs/legacy/README.md](docs/legacy/README.md).

Preserved notices: **Copyright 2018 Fatec Americana** (original README) and **Copyright (c) 2018 Kléber de Oliveira Andrade** ([LICENSE](LICENSE)). Original repository material and new project source are MIT where rights permit. Dependency packages and linked datasheets retain their respective authorship and licenses; no rights to third-party hardware documentation are asserted.
