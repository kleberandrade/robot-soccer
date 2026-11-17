import {
  createMatch,
  referee,
  step,
  advance,
  parseCommands,
  decideReferee,
  CONFIG,
  type ConfigInput,
  type Match,
  type Team,
  type Command,
  type Action,
} from "@robot-soccer/engine";
export class RoomError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export type Participant = { name: string; lastSeen: number | null };
export type RoomState = {
  version: 1;
  name: string;
  turn: number;
  match: Match;
  participants: Record<Team, Participant | null>;
  pending: Record<Team, Command[] | null>;
};
export function newRoomState(
  name: string,
  config: ConfigInput = CONFIG,
): RoomState {
  return {
    version: 1,
    name,
    turn: 0,
    match: createMatch(config),
    participants: { blue: null, yellow: null },
    pending: { blue: null, yellow: null },
  };
}
export function joinParticipant(
  state: RoomState,
  team: Team,
  name: string,
  now: number,
): RoomState {
  const r = structuredClone(state);
  r.participants[team] = { name, lastSeen: now };
  return r;
}
function clearTurn(r: RoomState) {
  r.turn++;
  r.pending = { blue: null, yellow: null };
  return r;
}
export function roomAction(
  state: RoomState,
  action: Action | "clock",
): RoomState {
  const r = structuredClone(state);
  if (action === "start" && (!r.participants.blue || !r.participants.yellow))
    throw new RoomError(409, "Both teams must join before the whistle.");
  if (action === "clock") {
    if (!["halftime", "timeout"].includes(r.match.phase))
      throw new RoomError(409, "The clock requires an interval or timeout.");
    r.match = advance(r.match, 60);
  } else r.match = referee(r.match, action);
  return clearTurn(r);
}
export function roomDecision(state: RoomState, decision: unknown) {
  const r = structuredClone(state);
  r.match = decideReferee(r.match, decision);
  return clearTurn(r);
}
export function submitTurn(
  state: RoomState,
  team: Team,
  turn: number,
  input: unknown,
  now: number,
): RoomState {
  if (turn !== state.turn)
    throw new RoomError(
      409,
      "This turn has already changed. Fetch the latest observation.",
    );
  if (state.match.phase !== "running")
    throw new RoomError(409, "Wait for the referee whistle.");
  if (state.pending[team] !== null)
    throw new RoomError(409, "Your team already submitted this turn.");
  const commands = validatedCommands(team, input),
    r = structuredClone(state);
  if (!r.participants[team])
    throw new RoomError(403, "Join this team before submitting commands.");
  r.participants[team]!.lastSeen = now;
  r.pending[team] = commands;
  if (r.pending.blue === null || r.pending.yellow === null) return r;
  const all = [...r.pending.blue, ...r.pending.yellow];
  for (let i = 0; i < 6 && r.match.phase === "running"; i++)
    r.match = step(r.match, all);
  return clearTurn(r);
}

function validatedCommands(team: Team, input: unknown) {
  try {
    return parseCommands(team, input);
  } catch {
    throw new RoomError(
      400,
      "Commands must be valid wheel speeds for your own three robots.",
    );
  }
}
