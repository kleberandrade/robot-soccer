import { z } from "zod";
import { body } from "../../../../../src/http";
import {
  loadRoom,
  authorizeRoom,
  publicRoom,
  saveRoom,
} from "../../../../../src/room-store";
import { RoomError, submitTurn } from "../../../../../src/room-domain";
import { roomJson, roomFailure, roomId } from "../../../../../src/room-http";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const id = await roomId(context),
      input = z
        .object({
          turn: z.number().int().min(0),
          commands: z.array(z.unknown()).max(3),
        })
        .strict()
        .parse(await body(request));
    for (let attempt = 0; attempt < 4; attempt++) {
      const row = await loadRoom(id),
        role = authorizeRoom(row, request);
      if (role !== "blue" && role !== "yellow")
        throw new RoomError(403, "Use your team connection key.");
      const next = submitTurn(
          row.state,
          role,
          input.turn,
          input.commands,
          Date.now(),
        ),
        saved = await saveRoom(row, next);
      if (saved) return roomJson(publicRoom(saved, role));
    }
    throw new RoomError(409, "The room changed. Fetch the latest observation.");
  } catch (e) {
    return roomFailure(e);
  }
}
