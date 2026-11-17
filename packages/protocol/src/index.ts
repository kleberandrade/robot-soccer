import { z } from "zod";
export type Team = "blue" | "yellow";
export type Command = { id: string; left: number; right: number };
const CommandSchema = z
  .array(
    z
      .object({
        id: z.string(),
        left: z.number().min(-0.6).max(0.6),
        right: z.number().min(-0.6).max(0.6),
      })
      .strict(),
  )
  .max(3);
export function parseCommands(team: Team, input: unknown): Command[] {
  const commands = CommandSchema.parse(input),
    ids = new Set<string>();
  for (const c of commands) {
    if (![0, 1, 2].some((i) => c.id === `${team}-${i}`) || ids.has(c.id))
      throw new Error("Command ownership or duplicate ID");
    ids.add(c.id);
  }
  return commands;
}
