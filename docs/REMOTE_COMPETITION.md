# Connect your code to a private competition

A private room puts two independently running team programs on one authoritative playing field. Each participant runs their code on their own computer. The server receives wheel commands and computes the official physics, clock, fouls and score.

Open [Private competitions](/compete) to create, join or reconnect to a room. A host can manage the match without receiving either participant's source code.

## 1. The host creates a private room

Choose **Create a room**, enter a name and the existing server operator token. Room creation requires the operator; participants never need that global token.

The host receives:

- A private host connection, with authority over the whistle, pause, reset and referee decisions.
- A **blue team invitation** and a different **yellow team invitation**. Share each code privately with the intended participant.
- A separate spectator connection, for people who should watch without controlling a team.

Rooms expire after 24 hours. There is no public room directory. Room IDs alone do not grant access, and room checkpoints are separate from the older public laboratory matches.

Use **Save connection** before refreshing or closing the page. Access keys stay in browser memory; they are not placed in the URL or saved to browser storage. The download contains a private capability and belongs outside Git. If downloading is unavailable, expand **Show private connection settings** and save the displayed text into the indicated environment file.

## 2. Each participant claims a team

Open **Join a team**, enter the invitation supplied by the host and choose your team's name. The invitation determines your color; you cannot select the opponent's side.

The browser creates a random team key and claims that invitation. A different key cannot claim the same team afterward. Save the team connection immediately. If you lose it, ask the host to start a new room; there is no anonymous key-recovery flow.

Both teams must join before the first whistle. The host's page shows claimed teams and which side still owes commands for the current turn. A claimed team does not prove a program is currently online.

## 3. Run Koativa and Circuit from separate computers

Clone the repository and install the dependencies:

```sh
npm ci
```

Place your downloaded connection file in the project root. For a blue participant, the file is named `.env.room-blue` and contains:

```dotenv
BASE_URL=https://robot-soccer.vercel.app
ROOM_ID=your-private-room-uuid
ROOM_KEY=your-private-team-key
```

The project's `.gitignore` excludes `.env*`. Keep the real file private. Do not paste its contents into an issue, public chat, source file or screenshot.

Computer A can run Koativa:

```sh
node --env-file=.env.room-blue --import tsx examples/remote-team.ts koativa
```

Computer B can run Circuit with its own saved connection:

```sh
node --env-file=.env.room-yellow --import tsx examples/remote-team.ts circuit
```

The host presses **Whistle / resume**. Both programs now receive observations and submit commands independently. Any side can use either example policy; team identity is the name chosen at join time.

For a short controlled exercise, append `--turns 20`. With no referee interruption, two clients submitting twenty turns each advance 120 physics ticks, or two simulated seconds. The final client message reports accepted submissions. Stop a client with Ctrl+C when finished.

The runnable source is `examples/remote-team.ts`. It calls the same `koativa` and `circuit` modules used by the local laboratory. Replace the selected policy call with your own function while retaining observation and command validation.

## 4. What happens during a turn

The room exposes an integer `turn` and one official match checkpoint. Each team may submit at most once for that turn.

1. Blue and yellow read the same checkpoint and compute their commands.
2. The first valid submission is queued. Physics does not advance.
3. The other team submits for that same turn.
4. The server applies both command sets for up to six 60 Hz physics ticks, stopping early if the referee halts play.
5. The server commits one new checkpoint, clears the queue and increments `turn`.

Queued commands are not shown to the opponent before the turn completes. Competing requests merge through optimistic revision checks. A stale or duplicate turn is rejected with 409, so retrying a request cannot grant extra movement.

This is **network lockstep**, not a wall-clock real-time service. Network and database latency can slow the game. A faster connection cannot take extra simulation turns. If either client disconnects or stops sending, the next turn freezes. Previous commands are not replayed indefinitely.

## 5. The host remains the referee

The host can whistle, pause, reset and make an explicit foul/restart decision. Participants cannot use their team keys for these actions. A pause or referee decision invalidates pending submissions so a pre-stop command cannot run after the whistle.

The host dashboard advances timeout/halftime clocks while it remains open. A live match advances through the two participant programs. A stopped set piece waits for a human whistle. There is no automatic goal award, human driving interface or code-upload runner.

The private dashboard includes synchronized 3D and overhead-camera views, current score, waiting-side status and the recent referee record. The **Reconnect** tab accepts a saved room ID and host, team or spectator key.

## Language-independent HTTP contract

Any language with HTTPS and JSON support can implement a client. Keep credentials in an authorization header:

```http
Authorization: Bearer YOUR_TEAM_KEY
Content-Type: application/json
```

Read the official checkpoint:

```http
GET /api/rooms/ROOM_ID
```

The response includes `role`, `turn`, `match`, `participants`, `waitingFor`, `revision` and `expiresAt`. For a team key, `role` is `blue` or `yellow`. Construct the engine-compatible observation as `{version:1, team:role, state:match}`. Coordinates are meters; angles are radians; wheel commands are m/s.

Submit a turn:

```http
POST /api/rooms/ROOM_ID/commands
```

```json
{
  "turn": 21,
  "commands": [
    { "id": "blue-0", "left": 0.25, "right": 0.30 },
    { "id": "blue-1", "left": 0.00, "right": 0.00 },
    { "id": "blue-2", "left": 0.00, "right": 0.00 }
  ]
}
```

Use your actual observed turn and your own color. Each request accepts up to three unique robot IDs with finite wheel speeds between −0.6 and +0.6 m/s. An omitted robot requests zero target speed. Bodies are bounded to 4096 bytes.

Treat 401 as invalid credentials, 403 as a role violation, 404 as an unavailable/expired room, and 409 as a changed turn or stopped match: read the checkpoint again. Do not continue retrying an old command against a new observation.

Host creation is `POST /api/rooms` with its operator credential and `{name,config?}`. Claiming is `POST /api/rooms/join` with `{code,name,key}`; `key` is the participant's random 32-byte base64url key. Host-only `PATCH /api/rooms/ROOM_ID` uses `{revision,action}` or `{revision,action:"decision",decision}`. See the supplied client and smoke tests for working requests.

## Scope and good experiments

Start with unchanged Koativa versus Circuit. Predict one strategy change, run a new room under the same configuration, and compare positioning, fouls and goals. A different state hash or a win alone does not explain why a policy improved.

The service stores hashes of private credentials, keeps team ownership separate and rejects unauthorized mutation. It is a single-operator educational competition service, without participant accounts, public matchmaking, rankings, tournament anti-cheat certification or arbitrary-source execution. Local code must also be supervised separately before it controls physical motors.
