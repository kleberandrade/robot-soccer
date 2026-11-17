# Wheel protocol v1, match state v2 and trusted team workflow

Coordinates are meters about field center; x runs along length and y across width. Angles are radians about the vertical axis. Blue attacks +x in the first half, yellow −x, with direction reversed in the second half. Time is integer 60 Hz ticks; wheel velocities are m/s, bounded to ±0.6. IDs are `blue-0..2` and `yellow-0..2`.

`observe(state, team)` returns `{version:1, team, state}` as an independent deep copy. Observations contain perfect simulated positions, not camera detections. Each built-in strategy returns up to three `{id,left,right}` commands. Every command is validated for finite values, range, duplicate IDs and team ownership. Missing commands request zero target speed. Actual speed slews toward the target under the configured motor acceleration; referee stops set both to zero immediately. Referee management commands are outside this team-command interface. Strategies execute synchronously only because they are registered project code; this is not isolation against malicious programs.

Run `npm run simulate` for an entire deterministic match and a final SHA-256 of its state. The engine package exposes `createMatch`, `observe`, `referee`, `step` and bounded `advance`; the teams entrypoint exposes `autonomous`, `koativa` and `circuit`. Tests demonstrate custom command injection into a local simulation. There is no upload/compile endpoint or server-side execution of unknown teams.

## Authoritative state and compatibility

The current match has `version:2`: actual/target wheel speeds, integrated left/right wheel angles (radians), exclusion metadata, numeric timeout counts, restart setup/live state and bounded referee history/counters. Team observations retain envelope `version:1`; radio/command format is unchanged. A stopped restart uses phase `stoppage`, and `start` is the whistle. Advancing a stopped match consumes no playing ticks.

Persisted version-1 checkpoints are upgraded on read without rewriting stored data: old dimensions/timing and manual-only instantaneous-drive behavior are preserved, boolean timeouts become counts, and new referee/wheel fields receive safe defaults. The next authenticated update saves v2. Existing replay chunks keep their original checkpoint version; replay consumers must hydrate each checkpoint before feeding the current engine. A camera configuration is local presentation state, not authoritative control.

## HTTP

- `GET /api/health`: configuration indicators, not a connectivity assertion.
- `POST /api/matches`: operator bearer token; JSON `{config?,strategies?}` creates a UUID match at revision 0. Only `balanced` and `press` are registered.
- `GET /api/matches/:id`: public UUID read, no cache.
- `PATCH /api/matches/:id`: bearer token; `{revision,action,ticks?}`. Actions: `advance`, `start`, `pause`, `reset`, `timeout-blue`, `timeout-yellow`, and `decision`. A decision body is `{revision,action:"decision",decision:{kind,team,robotId?}}`; `team` is the offending side, and an optional robot ID must belong to it. See the engine DecisionSchema for the bounded incident list. Only advance uses ticks (1–120, default 120). Returns `{id,revision,state,frames?}`. Stale revisions return 409. Invalid input/transitions return 400, authentication failures 401, absent matches 404, and unavailable persistence 503.
- `GET /api/matches/:id/replay?after=0`: at most 20 ordered chunks and a `next` revision cursor. Each chunk includes the action, frames and authoritative checkpoint. Continue with `after=next` until empty. The current UI links the export; it does not offer a full timeline editor.

Mutating bodies are limited to 4096 bytes, including streaming requests without a Content-Length. SQL is parameterized. UUID knowledge grants spectator access, so do not store private participant information in match state. Clients must recover from 409 by reloading the match. The last batch may run ahead of the displayed frame; pausing displays the current authoritative checkpoint.

## Team computer → robot radio

The local bridge accepts newline-delimited `{version:1,team,commands:[{id,left,right}]}`. See `examples/commands.ndjson`. Default execution validates and prints dry-run summaries; it does not open a radio socket:

```sh
npm run bridge < examples/commands.ndjson
```

For separately supervised physical testing, configure `TEAM` and `ROBOT_ENDPOINTS` as a JSON array of three `{host,key}` records, one per robot. Keys must be independently generated 32-byte hex values, matching ignored firmware `secrets.h`. `npm run bridge -- --send` is the explicitly armed mode. Do not pipe accelerated simulation output into physical motors. Do not expose the WLAN/UDP port to the Internet. Only the team computer should send commands to its three robot IPs.

The firmware listens on UDP 20011. A datagram is exactly 30 bytes: ASCII `RS` at 0–1; version 1 at 2; robot ID 0–2 at 3; sequence uint32 little-endian at 4–7; left/right int16 mm/s at 8–11; TTL uint16 milliseconds at 12–13; HMAC-SHA256 truncated to 16 bytes at 14–29, over the first 14 bytes. TTL must be 1–250 ms. Sequence must increase monotonically during each boot. The bridge currently sends TTL 200 ms. Send at 20–60 Hz during a real autonomous loop; a stopped stream causes firmware shutdown.

Telemetry is a bounded JSON acknowledgement with version, robot ID, last sequence and applied open-loop wheel command. It is not authenticated, odometry, measured speed or a reliable safety feedback channel. The firmware also stops on WLAN disconnect. Invalid datagrams never refresh the deadline. A physical power switch remains necessary. Restarting a robot resets its sequence state; rotate keys for new physical sessions because v1 has no challenge-based reboot anti-replay handshake.
