import { z } from "zod";
import { RoomError } from "./room-domain";
export const roomJson = (value: unknown, status = 200) =>
  Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
export function roomFailure(error: unknown) {
  if (error instanceof RoomError)
    return roomJson({ error: error.message }, error.status);
  if (error instanceof z.ZodError || error instanceof SyntaxError)
    return roomJson({ error: "Invalid room request." }, 400);
  if (
    error instanceof Error &&
    /Body|requires|Only |Timeout/.test(error.message)
  )
    return roomJson(
      { error: "Invalid room request or referee transition." },
      400,
    );
  console.error(
    "Room request failed:",
    error instanceof Error ? error.name : "unknown",
  );
  return roomJson({ error: "Room service unavailable." }, 503);
}
export async function roomId(context: { params: Promise<{ id: string }> }) {
  return z.uuid().parse((await context.params).id);
}
