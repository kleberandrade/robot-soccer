# Security review and boundaries

Scope: this project's simulation API, persistence and local robot bridge. No third-party systems or real robots were penetration-tested. Automated dependency audit reported zero production advisories at the time of implementation; this is not a guarantee about future vulnerabilities. Input, authentication, SQL and execution boundaries were manually reviewed.

## Controls implemented

Mutating routes require a server secret of at least 32 characters. Token bytes are length-checked before constant-time comparison, including non-ASCII test coverage. Tokens are never sent as URL parameters, persisted in the browser or returned by health endpoints. Request parsing limits actual streamed bytes to 4096. Zod rejects unknown input fields and arbitrary code uploads. Route callers cannot submit a complete state, wheel commands or a team-program path.

Commands cross a distinct finite-number, magnitude, duplicate-ID and team-ownership boundary. Team observations are deep copies. Only built-in strategy identifiers are accepted. This prevents accidental cross-team state mutation and command spoofing through the exposed protocol; **it is not a sandbox for hostile JavaScript**. Never add eval, child processes or dynamic remote imports to a Function. Supporting untrusted teams requires a separate isolated runtime with CPU/memory/time/network restrictions.

Database data is parameterized. A conditional revision update and replay insertion share one SQL statement; the losing writer returns 409 without adding a replay event. Pagination bounds replay reads. Production accepts dedicated Neon hostnames only. Database errors expose a generic service-unavailable response, not a URL or password. Migrations are a separate operator action. No per-tick database write or process-global mutable match store is used.

The firmware validates exact packet length, magic/version/robot ID, wheel range and TTL. Truncated HMAC authenticates the header, a monotonic sequence rejects stale packets within a boot, invalid input does not refresh the deadline, and lost WLAN/expired commands disable the motor driver. STBY must have an external pulldown. The bridge is dry-run by default. No physical transmission was performed during development.

## Remaining risks and release gates

- **Medium — single operator credential.** Every holder can manage all matches; no user accounts, team tenancy, audit identity, rate quota or automatic token rotation exists. Keep this a controlled lab. Add identity and per-match authorization before multi-user tournament use.
- **Medium — authenticated resource consumption.** A valid operator can create many matches or request accelerated batches. The API bounds per-request work but has no durable account quota/retention policy. Use Vercel spending controls and access restrictions appropriate to the account, monitor usage, and implement quotas before opening operator access broadly.
- **Low — public spectator data.** UUID-based match/replay reads are public, so state must contain no private participant information. UUID possession is not authorization for confidential content.
- **Medium — reboot anti-replay and radio availability.** Firmware sequence state resets on boot; there is no session challenge, key rotation service or authenticated telemetry. Use separate per-robot keys, rotate for physical sessions, isolate the team WLAN and add a challenge protocol before adversarial competition. HMAC does not prevent RF jamming. The hardware watchdog/power switch remains essential.
- **Medium — unvalidated actuation.** PWM is open-loop; no measured speed, encoders, odometry, battery sensor or independent external safety controller is implemented. A valid packet can move a correctly configured physical robot. Supervised bench validation, wheels clear of the surface and a physical cutoff are required before use.

No high/critical finding was identified in the limited reviewed scope. That statement is scoped to the current design and checks, not a production security certification. Report issues privately to the repository owner; never attach live tokens or WLAN credentials to public issues.
