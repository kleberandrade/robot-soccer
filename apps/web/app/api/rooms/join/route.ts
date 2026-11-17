import { z } from "zod";
import { body } from "../../../../src/http";
import { loadRoom, claimTeam, publicRoom } from "../../../../src/room-store";
import {
  secretHash,
  normalizeInvitation,
  equalHash,
} from "../../../../src/room-auth";
import { RoomError, joinParticipant } from "../../../../src/room-domain";
import { roomJson, roomFailure } from "../../../../src/room-http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const input = z
      .object({
        code: z.string().min(16).max(24),
        name: z.string().trim().min(1).max(40),
        key: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
      })
      .strict()
      .parse(await body(request));
    const hash = secretHash(normalizeInvitation(input.code)),
      keyHash = secretHash(input.key);
    for (let attempt = 0; attempt < 4; attempt++) {
      const row = await loadRoom(hash, "invitation"),
        team = equalHash(hash, row.blue_invite_hash) ? "blue" : "yellow",
        existing = team === "blue" ? row.blue_key_hash : row.yellow_key_hash;
      if (existing && !equalHash(keyHash, existing))
        throw new RoomError(
          409,
          "This team has already been claimed. Use its saved connection key.",
        );
      const saved = await claimTeam(
        row,
        joinParticipant(row.state, team, input.name, Date.now()),
        team,
        keyHash,
      );
      if (saved) return roomJson({ room: publicRoom(saved, team) });
    }
    throw new RoomError(409, "The room changed. Try joining again.");
  } catch (e) {
    return roomFailure(e);
  }
}
