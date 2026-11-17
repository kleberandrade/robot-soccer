import { z } from "zod";
import { type Match, ConfigSchema, USER_CONFIG, emptyOfficials } from "./model";
const team = z.enum(["blue", "yellow"]),
  counts = z.object({
    blue: z.number().int().min(0),
    yellow: z.number().int().min(0),
  });
const number = z.number(),
  tick = z.number().int().min(0);
const robot = z.object({
  id: z.string().regex(/^(blue|yellow)-[0-2]$/),
  team,
  role: z.enum(["striker", "defender", "keeper"]),
  x: number,
  y: number,
  angle: number,
  left: number,
  right: number,
  targetLeft: number,
  targetRight: number,
  leftRotation: number,
  rightRotation: number,
  excludedUntil: tick.nullable(),
  releaseOnScore: tick.nullable(),
});
const restart = z.object({
  kind: z.enum(["kickoff", "penalty", "free-kick", "goal-kick", "free-ball"]),
  team: team.nullable(),
  x: number,
  y: number,
  takerId: z.string().nullable(),
  keeperId: z.string().nullable(),
  stage: z.enum(["setup", "live"]),
  warnings: counts,
});
const event = z.object({
  id: tick,
  tick,
  matchTick: tick,
  kind: z.string(),
  team: team.nullable(),
  restart: z
    .enum(["kickoff", "penalty", "free-kick", "goal-kick", "free-ball"])
    .nullable(),
  source: z.enum(["automatic", "referee", "system"]),
  message: z.string(),
});
export const MatchSchema: z.ZodType<Match> = z.object({
  version: z.literal(2),
  config: ConfigSchema,
  tick,
  elapsedTicks: tick,
  period: z.union([z.literal(1), z.literal(2)]),
  phase: z.enum([
    "ready",
    "running",
    "paused",
    "halftime",
    "timeout",
    "stoppage",
    "finished",
  ]),
  phaseTicks: tick,
  score: counts,
  timeouts: counts,
  strategies: z.object({
    blue: z.enum(["balanced", "press"]),
    yellow: z.enum(["balanced", "press"]),
  }),
  robots: z.array(robot).length(6),
  ball: z.object({ x: number, y: number, vx: number, vy: number }),
  restart: restart.nullable(),
  officials: z.object({
    eventCount: tick,
    events: z.array(event).max(32),
    fouls: counts,
    yellowCards: counts,
    areaTicks: z.record(z.string(), tick),
    keeperTicks: counts,
    pushingTicks: z.record(z.string(), tick),
    forcedArea: z.record(z.string(), z.boolean()),
    stalledTicks: tick,
    anchor: z.object({ x: number, y: number }),
  }),
});
export function hydrateMatch(input: unknown): Match {
  const raw = z.record(z.string(), z.unknown()).parse(input);
  if (raw.version === 2) return MatchSchema.parse(raw);
  if (raw.version !== 1) throw new Error("Unsupported match state version");
  const config = z.record(z.string(), z.unknown()).parse(raw.config),
    timeouts = z
      .object({ blue: z.boolean(), yellow: z.boolean() })
      .parse(raw.timeouts);
  const robots = z
    .array(z.record(z.string(), z.unknown()))
    .parse(raw.robots)
    .map((r) => ({
      ...r,
      targetLeft: r.left,
      targetRight: r.right,
      leftRotation: 0,
      rightRotation: 0,
      excludedUntil: null,
      releaseOnScore: null,
    }));
  return MatchSchema.parse({
    ...raw,
    version: 2,
    config: {
      ...USER_CONFIG,
      ...config,
      automaticReferee: false,
      motorAcceleration: 0,
      timeoutLimit: 1,
      cornerChamfer: 0,
    },
    timeouts: { blue: Number(timeouts.blue), yellow: Number(timeouts.yellow) },
    robots,
    restart: null,
    officials: emptyOfficials(),
  });
}
