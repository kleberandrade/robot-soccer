import { z } from "zod";
import type { Team } from "@robot-soccer/protocol";
export type { Team, Command } from "@robot-soccer/protocol";
export const DT = 1 / 60,
  BALL_RADIUS = 0.02135,
  ROBOT_RADIUS = 0.075 / Math.SQRT2,
  WHEEL_BASE = 0.065;
export const CONFIG = {
  ruleset: "vsss-larc-reference" as const,
  length: 1.5,
  width: 1.3,
  goalWidth: 0.4,
  goalDepth: 0.1,
  goalAreaWidth: 0.7,
  goalAreaDepth: 0.15,
  goalArcWidth: 0.2,
  goalArcDepth: 0.05,
  centerRadius: 0.2,
  cornerChamfer: 0.07,
  robotSide: 0.075,
  robotHeight: 0.065,
  wheelBase: 0.065,
  wheelRadius: 0.016,
  motorAcceleration: 3,
  halfSeconds: 300,
  intervalSeconds: 480,
  timeoutSeconds: 180,
  timeoutLimit: 2,
  automaticReferee: true,
  pushingSeconds: 0.3,
};
export const USER_CONFIG = {
  ...CONFIG,
  ruleset: "user-reference" as const,
  width: 1.2,
  intervalSeconds: 600,
  timeoutSeconds: 120,
  timeoutLimit: 1,
  motorAcceleration: 0,
  automaticReferee: false,
  cornerChamfer: 0,
};
export const ConfigSchema = z
  .object({
    ruleset: z
      .enum(["vsss-larc-reference", "user-reference", "custom"])
      .default(CONFIG.ruleset),
    length: z.number().min(1).max(3),
    width: z.number().min(0.8).max(2),
    goalWidth: z.number().min(0.2).max(0.6),
    goalDepth: z.number().min(0.08).max(0.2).default(0.1),
    goalAreaWidth: z.number().min(0.5).max(0.9).default(0.7),
    goalAreaDepth: z.number().min(0.12).max(0.3).default(0.15),
    goalArcWidth: z.number().min(0.1).max(0.3).default(0.2),
    goalArcDepth: z.number().min(0.02).max(0.1).default(0.05),
    centerRadius: z.number().min(0.1).max(0.3).default(0.2),
    cornerChamfer: z.number().min(0).max(0.1).default(0.07),
    robotSide: z.number().min(0.065).max(0.08).default(0.075),
    robotHeight: z.number().min(0.035).max(0.075).default(0.065),
    wheelBase: z.number().min(0.04).max(0.074).default(0.065),
    wheelRadius: z.number().min(0.01).max(0.025).default(0.016),
    motorAcceleration: z.number().min(0).max(20).default(3),
    halfSeconds: z.number().int().min(1).max(600),
    intervalSeconds: z.number().int().min(1).max(600),
    timeoutSeconds: z.number().int().min(1).max(180),
    timeoutLimit: z.number().int().min(1).max(2).default(2),
    automaticReferee: z.boolean().default(true),
    pushingSeconds: z.number().min(0.1).max(2).default(0.3),
  })
  .strict()
  .superRefine((c, ctx) => {
    if (c.goalAreaWidth >= c.width || c.goalWidth >= c.goalAreaWidth)
      ctx.addIssue({
        code: "custom",
        message: "Goal and area must fit inside the field",
      });
    if (c.wheelBase + 0.006 > c.robotSide + 0.000001)
      ctx.addIssue({
        code: "custom",
        message: "Wheels must fit within the robot envelope",
      });
    if (2 * c.wheelRadius > c.robotHeight)
      ctx.addIssue({
        code: "custom",
        message: "Wheel diameter must fit within the robot height",
      });
    if (c.ruleset === "vsss-larc-reference" && c.robotSide > 0.075)
      ctx.addIssue({
        code: "custom",
        message: "Bare VSSS robots must fit within 75 mm",
      });
  });
export type Config = z.output<typeof ConfigSchema>;
export type ConfigInput = z.input<typeof ConfigSchema>;
export type Strategy = "balanced" | "press";
export type Phase =
  | "ready"
  | "running"
  | "paused"
  | "halftime"
  | "timeout"
  | "stoppage"
  | "finished";
export type Robot = {
  id: string;
  team: Team;
  role: "striker" | "defender" | "keeper";
  x: number;
  y: number;
  angle: number;
  left: number;
  right: number;
  targetLeft: number;
  targetRight: number;
  leftRotation: number;
  rightRotation: number;
  excludedUntil: number | null;
  releaseOnScore: number | null;
};
export type Ball = { x: number; y: number; vx: number; vy: number };
export const FoulKinds = [
  "personal-foul",
  "handling",
  "attacking-overload",
  "defensive-overload",
  "keeper-retention",
  "goalkeeper-block",
  "goalkeeper-push",
  "goal-area-stalemate",
  "false-start",
  "free-ball",
] as const;
export const DecisionSchema = z
  .object({
    kind: z.enum(FoulKinds),
    team: z.enum(["blue", "yellow"]),
    robotId: z
      .string()
      .regex(/^(blue|yellow)-[0-2]$/)
      .optional(),
  })
  .strict()
  .refine(
    (d) => !d.robotId || d.robotId.startsWith(d.team + "-"),
    "Robot must belong to the offending team",
  );
export type Decision = z.infer<typeof DecisionSchema>;
export type RestartKind =
  "kickoff" | "penalty" | "free-kick" | "goal-kick" | "free-ball";
export type Restart = {
  kind: RestartKind;
  team: Team | null;
  x: number;
  y: number;
  takerId: string | null;
  keeperId: string | null;
  stage: "setup" | "live";
  warnings: Record<Team, number>;
};
export type RefereeEvent = {
  id: number;
  tick: number;
  matchTick: number;
  kind: string;
  team: Team | null;
  restart: RestartKind | null;
  source: "automatic" | "referee" | "system";
  message: string;
};
export type Officials = {
  eventCount: number;
  events: RefereeEvent[];
  fouls: Record<Team, number>;
  yellowCards: Record<Team, number>;
  areaTicks: Record<string, number>;
  keeperTicks: Record<Team, number>;
  pushingTicks: Record<string, number>;
  forcedArea: Record<string, boolean>;
  stalledTicks: number;
  anchor: { x: number; y: number };
};
export type Match = {
  version: 2;
  config: Config;
  tick: number;
  elapsedTicks: number;
  period: 1 | 2;
  phase: Phase;
  phaseTicks: number;
  score: Record<Team, number>;
  timeouts: Record<Team, number>;
  strategies: Record<Team, Strategy>;
  robots: Robot[];
  ball: Ball;
  restart: Restart | null;
  officials: Officials;
};
export type Observation = { version: 1; team: Team; state: Match };
export type Action =
  "start" | "pause" | "reset" | "timeout-blue" | "timeout-yellow";
export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
export const otherTeam = (team: Team): Team =>
  team === "blue" ? "yellow" : "blue";
export const direction = (team: Team, period: number) =>
  (team === "blue" ? 1 : -1) * (period === 1 ? 1 : -1);
export const robotRadius = (c: Config) => c.robotSide / Math.SQRT2;
export const isActive = (r: Robot) => r.excludedUntil === null;
export function emptyOfficials(): Officials {
  return {
    eventCount: 0,
    events: [],
    fouls: { blue: 0, yellow: 0 },
    yellowCards: { blue: 0, yellow: 0 },
    areaTicks: {},
    keeperTicks: { blue: 0, yellow: 0 },
    pushingTicks: {},
    forcedArea: {},
    stalledTicks: 0,
    anchor: { x: 0, y: 0 },
  };
}
export function recordEvent(
  s: Match,
  event: Omit<RefereeEvent, "id" | "tick" | "matchTick">,
) {
  s.officials.eventCount++;
  s.officials.events = [
    ...s.officials.events.slice(-31),
    {
      ...event,
      id: s.officials.eventCount,
      tick: s.tick,
      matchTick: s.elapsedTicks,
    },
  ];
}
export function stopWheels(s: Match) {
  for (const r of s.robots) {
    r.left = 0;
    r.right = 0;
    r.targetLeft = 0;
    r.targetRight = 0;
  }
}
