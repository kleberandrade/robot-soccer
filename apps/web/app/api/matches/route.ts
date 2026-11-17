import { randomUUID } from "node:crypto";
import { insertMatch } from "@robot-soccer/database";
import { newMatch } from "../../../src/service";
import { authorized, body, failure } from "../../../src/http";
export const runtime = "nodejs";
export const maxDuration = 10;
export async function POST(request: Request) {
  if (!authorized(request))
    return Response.json(
      { error: "Operator authentication required" },
      { status: 401 },
    );
  try {
    return Response.json(
      await insertMatch(randomUUID(), newMatch(await body(request))),
      { status: 201 },
    );
  } catch (e) {
    return failure(e);
  }
}
