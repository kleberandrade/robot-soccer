# Implementation and verification log

## Scope and repository safety — 2026-11-17

- Verified authenticated GitHub identity `kleberandrade`, admin permission, source repository ID `156891081`, public visibility and default branch `master`. Verified `robot-soccer` did not resolve before renaming; no local soccer clone or destination directory existed. Cloned the original repository and renamed it through GitHub after these checks. Updated origin to `kleberandrade/robot-soccer`; no force push, repository replacement or history deletion.
- Source contained only README and MIT license. Preserved LICENSE and the full original institutional README in `docs/legacy/README.md`; retained Fatec Americana's notice and advisor credit in the English README.
- Read the requested reduced-principles instructions and applied the requested architecture, Next.js, React performance, test and security guidance. Used pure domain functions, bounded external validation, separate ownership and explicit architecture decisions. No subagents were used.

## Ordered implementation

1. Wrote engine behavior tests before the initial implementation; the first run failed on the absent engine. Added the fixed-step engine, independent team observations, registered strategies, match state machine and command boundary, then obtained passing behavior tests.
2. Implemented bounded Next.js mutation/read routes and an atomic PostgreSQL checkpoint/replay operation, with no arbitrary-code or wheel-control HTTP endpoint. Added a dedicated local PostgreSQL service, versioned migrations and idempotent seeds. Confirmed an actual competing update loses with 409 and inserts no replay duplicate.
3. Built the responsive live 3D field, camera controls, identifiers, trails, referee controls, team configuration and 2D fallback. Removed DOM-based Three.js labels after a development-renderer lifecycle error and replaced them with in-scene numeric meshes. Split the browser session/controls into small modules and bounded spectator/retry polling to once per second.
4. Added an ESP32-C3 firmware build, native parser tests, private-key configuration, HMAC radio commands, monotonic sequence checks, disconnect/deadline shutdown and a dry-run bridge. The first embedded compile identified pin-name collisions with Arduino constants; renamed the symbols and successfully rebuilt. No upload, motor actuation or physical packet transmission was performed.
5. At the user's follow-up request, converted the project to npm workspaces + Turborepo: web, bridge, simulator, engine, protocol and database. Retained one lockfile, added explicit shared-config cache dependencies and internal source transpilation for Next.js. Browser and Node-only protocol entrypoints are distinct.
6. Added original electrical SVG, BOM/dimension budget, pin map and hardware documentation. Component datasheets were checked; battery/protection sourcing and custom carrier layout remain explicit selection gates. Added rulebook differences, API/radio documentation, security review and CI.
7. Regression tests reproduced and fixed a non-ASCII token comparison exception and stale nonzero wheel commands on referee stops. Collision trajectory assertions were expanded following mutation-test survivors. No physical or competition validation is inferred from these software tests.

## Hosting and metadata

- Created Vercel project `robot-soccer` in the existing `pdjkleber-2231s-projects` scope, with Next.js application root `apps/web`; Vercel detected Turborepo. Initial production URL returned HTTP 200: https://robot-soccer.vercel.app . Its initial health result correctly showed no database/operator configuration before provisioning.
- Created a new, dedicated **Free** Neon project `robot-soccer`, ID `morning-scene-19536057`, in São Paulo. Connected **Production only**; existing databases and preview environments were left intact. Applied migration `001_initial.sql` and seed twice against the real Neon endpoint. The real-Neon persistence/concurrent-writer integration test passed.
- Vercel integration stores database variables as secrets. Added a separate random operator secret using Vercel's Secret variable type, Production only. Local migration credentials/operator secret are held in ignored `.env.neon` with owner-only permissions, never committed or printed. No upgrade or paid-plan selection was made.
- Browser approval review rejected a step it interpreted as an upgrade, then rejected deselecting Neon optional application authentication. Rechecked controls, proceeded through the existing Free integration and left optional Auth enabled. No rejected action was bypassed. This product does not use Neon Auth; that integration option does not replace PostgreSQL credentials or the operator token.
- Updated GitHub About/description and homepage. Preserved existing `unity`, `arduino`, `robotics`, `soccer-playing-robot` topics and added `esp32`, `neon`, `nextjs`, `robot-soccer`, `simulation`, `threejs`, `turborepo`, `typescript`, `vsss`.

## Verification performed

- Turborepo type checking across all six workspaces and optimized Next.js build passed locally.
- Unit/behavior tests cover clocks, scoring both ways, kickoff, differential motion, wall/contact impulses, replay reconstruction, bounds, command ownership, protocol encoding, authentication, stream size limits and browser session scheduling. Database tests require an explicit DATABASE_URL and are reported as skipped when it is absent, not counted as passed.
- Local PostgreSQL migration and seed were run repeatedly; state persisted across independent connections. HTTP smoke tested actual Next.js routes, 401 without authentication, creation/start, a 120-tick server batch, concurrent 200/409 outcomes and persisted replay frames.
- Firmware compiled using pinned Espressif32 6.12.0 / Arduino 2.0.17 on PlatformIO 6.2.0. Final successful embedded image used 20,344 bytes RAM and 363,360 bytes flash before subsequent software-only changes. Native C++ parser assertions passed. Bridge NDJSON example ran in dry-run only.
- Automated production dependency audit returned zero advisories. Manually reviewed authentication, secrets, SQL, payload limits, execution boundaries and radio safety assumptions; remaining risks are in SECURITY.md.
- Crapper and Dryer were run on the project. Shared engine/protocol/database and web service functions passed CRAP <10 when run per-workspace using their real coverage. A first root-level metrics pass incorrectly found stale coverage paths after the move; those results were discarded and rerun per workspace. UI functions were split; maximum cyclomatic complexity is now 8 without pretending UI coverage exists. Dryer found no candidates at similarity >=0.8.
- Mutator was run on the radio encoder and engine. Initial radio results were invalid because package-name imports resolved outside mutation overlays; relative test imports corrected the test target, and all 3 radio mutants were killed. Engine tests killed 119/182 mutants (65.4%) before the additional contact/stop regression cases; a later run is recorded below. Remaining equivalent/boundary/physics survivors must not be described as 100% mutation coverage.
- Browser checks exercised actual 3D rendering, movement, pause, and a 390-pixel responsive layout with 2D fallback. No benchmark or Core Web Vitals score is claimed.

## Remaining physical and competitive work

Select the real competition/edition and reconcile its rules; implement full referee situations if required. Source and measure the complete hardware BOM, finish carrier schematic/layout/ERC and mechanical CAD, validate power/thermal/cutoff behavior, then perform supervised motor/radio tests. Add measured speed control, encoders/odometry and camera calibration/detection as separate validated work. Harden identity, quotas/retention and isolated team runners before public tournaments or untrusted code.
