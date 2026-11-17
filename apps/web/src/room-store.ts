import { query } from "@robot-soccer/database";
import { randomUUID } from "node:crypto";
import { newRoomState, type RoomState, RoomError } from "./room-domain";
import {
  accessKey,
  invitation,
  secretHash,
  roleFor,
  bearerKey,
  type RoomRole,
} from "./room-auth";
import type { ConfigInput, Team } from "@robot-soccer/engine";
export type StoredRoom = {
  id: string;
  revision: number;
  state: RoomState;
  host_hash: string;
  spectator_hash: string;
  blue_invite_hash: string;
  yellow_invite_hash: string;
  blue_key_hash: string | null;
  yellow_key_hash: string | null;
  expires_at: string;
};
export async function createPrivateRoom(name: string, config: ConfigInput) {
  const id = randomUUID(),
    hostKey = accessKey(),
    spectatorKey = accessKey(),
    blueCode = invitation(),
    yellowCode = invitation(),
    state = newRoomState(name, config),
    expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const rows = await query(
    "INSERT INTO competition_rooms(id,state,host_hash,spectator_hash,blue_invite_hash,yellow_invite_hash,expires_at) VALUES($1,$2::jsonb,$3,$4,$5,$6,$7) RETURNING *",
    [
      id,
      JSON.stringify(state),
      secretHash(hostKey),
      secretHash(spectatorKey),
      secretHash(blueCode),
      secretHash(yellowCode),
      expiresAt,
    ],
  );
  return {
    row: rows[0] as StoredRoom,
    hostKey,
    spectatorKey,
    blueCode,
    yellowCode,
  };
}
function requireAvailable(row: StoredRoom | undefined) {
  if (!row || new Date(row.expires_at).getTime() <= Date.now())
    throw new RoomError(404, "Room unavailable or expired.");
  return row;
}
export async function loadRoom(value: string, by: "id" | "invitation" = "id") {
  const sql =
    by === "id"
      ? "SELECT * FROM competition_rooms WHERE id=$1"
      : "SELECT * FROM competition_rooms WHERE blue_invite_hash=$1 OR yellow_invite_hash=$1";
  return requireAvailable(
    (await query(sql, [value]))[0] as StoredRoom | undefined,
  );
}
export function authorizeRoom(row: StoredRoom, request: Request) {
  const role = roleFor(bearerKey(request), {
    host: row.host_hash,
    spectator: row.spectator_hash,
    blue: row.blue_key_hash,
    yellow: row.yellow_key_hash,
  });
  if (!role) throw new RoomError(401, "Private room credentials required.");
  return role;
}
export function publicRoom(row: StoredRoom, role: RoomRole) {
  const s = row.state;
  return {
    id: row.id,
    revision: row.revision,
    expiresAt: row.expires_at,
    name: s.name,
    turn: s.turn,
    match: s.match,
    participants: s.participants,
    waitingFor: (["blue", "yellow"] as Team[]).filter(
      (t) => s.pending[t] === null,
    ),
    role,
  };
}
export async function saveRoom(row: StoredRoom, state: RoomState) {
  const rows = await query(
    "UPDATE competition_rooms SET state=$3::jsonb,revision=revision+1 WHERE id=$1 AND revision=$2 AND expires_at>now() RETURNING *",
    [row.id, row.revision, JSON.stringify(state)],
  );
  return rows[0] as StoredRoom | undefined;
}
export async function claimTeam(
  row: StoredRoom,
  state: RoomState,
  team: Team,
  keyHash: string,
) {
  const sql =
    team === "blue"
      ? "UPDATE competition_rooms SET state=$3::jsonb,blue_key_hash=$4,revision=revision+1 WHERE id=$1 AND revision=$2 AND expires_at>now() AND (blue_key_hash IS NULL OR blue_key_hash=$4) RETURNING *"
      : "UPDATE competition_rooms SET state=$3::jsonb,yellow_key_hash=$4,revision=revision+1 WHERE id=$1 AND revision=$2 AND expires_at>now() AND (yellow_key_hash IS NULL OR yellow_key_hash=$4) RETURNING *";
  return (
    await query(sql, [row.id, row.revision, JSON.stringify(state), keyHash])
  )[0] as StoredRoom | undefined;
}
