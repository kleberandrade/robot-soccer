import { z } from "zod";
import { DecisionSchema } from "@robot-soccer/engine";
import { body } from "../../../../src/http";
import {
  loadRoom,
  authorizeRoom,
  publicRoom,
  saveRoom,
} from "../../../../src/room-store";
import {
  RoomError,
  roomAction,
  roomDecision,
} from "../../../../src/room-domain";
import { roomJson, roomFailure, roomId } from "../../../../src/room-http";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const row = await loadRoom(await roomId(context)),
      role = authorizeRoom(row, request);
    return roomJson(publicRoom(row, role));
  } catch (e) {
    return roomFailure(e);
  }
}
const Update = z.discriminatedUnion("action", [
  z
    .object({
      revision: z.number().int().min(0),
      action: z.enum([
        "start",
        "pause",
        "reset",
        "timeout-blue",
        "timeout-yellow",
        "clock",
      ]),
    })
    .strict(),
  z
    .object({
      revision: z.number().int().min(0),
      action: z.literal("decision"),
      decision: DecisionSchema,
    })
    .strict(),
]);
export async function PATCH(request: Request, context: Context) {
  try {
    const row = await loadRoom(await roomId(context)),
      role = authorizeRoom(row, request);
    if (role !== "host")
      throw new RoomError(403, "Only the host controls the referee.");
    const input = Update.parse(await body(request));
    if (input.revision !== row.revision)
      throw new RoomError(
        409,
        "The room changed. Refresh before this referee action.",
      );
    const next =
        input.action === "decision"
          ? roomDecision(row.state, input.decision)
          : roomAction(row.state, input.action),
      saved = await saveRoom(row, next);
    if (!saved)
      throw new RoomError(
        409,
        "The room changed. Refresh before this referee action.",
      );
    return roomJson(publicRoom(saved, role));
  } catch (e) {
    return roomFailure(e);
  }
}
