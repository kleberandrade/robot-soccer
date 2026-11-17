import { z } from "zod";
import { ConfigSchema, CONFIG } from "@robot-soccer/engine";
import { authorized, body } from "../../../src/http";
import { createPrivateRoom, publicRoom } from "../../../src/room-store";
import { roomJson, roomFailure } from "../../../src/room-http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (!authorized(request))
      return roomJson(
        { error: "Operator credentials required to create a room." },
        401,
      );
    const input = z
      .object({
        name: z.string().trim().min(1).max(60),
        config: ConfigSchema.default(CONFIG),
      })
      .strict()
      .parse(await body(request));
    const result = await createPrivateRoom(input.name, input.config);
    return roomJson(
      {
        room: publicRoom(result.row, "host"),
        key: result.hostKey,
        spectatorKey: result.spectatorKey,
        invitations: { blue: result.blueCode, yellow: result.yellowCode },
      },
      201,
    );
  } catch (e) {
    return roomFailure(e);
  }
}
