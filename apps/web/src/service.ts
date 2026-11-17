import { z } from "zod";
import {
  CONFIG,
  ConfigSchema,
  createMatch,
  advance,
  referee,
  DecisionSchema,
  decideReferee,
  type Match,
} from "@robot-soccer/engine";
export const CreateSchema = z
  .object({
    config: ConfigSchema.default(CONFIG),
    strategies: z
      .object({
        blue: z.enum(["balanced", "press"]),
        yellow: z.enum(["balanced", "press"]),
      })
      .strict()
      .default({ blue: "balanced", yellow: "press" }),
  })
  .strict();
const Revision = z.number().int().min(0);
export const UpdateSchema = z.discriminatedUnion("action", [
  z
    .object({
      revision: Revision,
      action: z.enum([
        "advance",
        "start",
        "pause",
        "reset",
        "timeout-blue",
        "timeout-yellow",
      ]),
      ticks: z.number().int().min(1).max(120).default(120),
    })
    .strict(),
  z
    .object({
      revision: Revision,
      action: z.literal("decision"),
      decision: DecisionSchema,
    })
    .strict(),
]);
export type Update = z.infer<typeof UpdateSchema>;
export function newMatch(input: unknown) {
  const p = CreateSchema.parse(input);
  return createMatch(p.config, p.strategies);
}
export function applyUpdate(state: Match, update: Update) {
  if (update.action === "decision")
    return {
      state: decideReferee(state, update.decision),
      frames: [] as Match[],
    };
  if (update.action !== "advance")
    return { state: referee(state, update.action), frames: [] as Match[] };
  const frames: Match[] = [];
  let s = state;
  for (let t = 0; t < update.ticks; t += 6) {
    if (!["running", "halftime", "timeout"].includes(s.phase)) break;
    s = advance(s, Math.min(6, update.ticks - t));
    frames.push(s);
  }
  return { state: s, frames };
}
