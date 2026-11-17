import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { insertMatch, getMatch, saveMatch, query } from "../src/index";
import { createMatch, referee, advance } from "@robot-soccer/engine";
describe.skipIf(!process.env.DATABASE_URL)(
  "real PostgreSQL persistence",
  () => {
    it("persists across reads and atomically rejects a competing writer", async () => {
      const id = randomUUID(),
        initial = createMatch();
      await insertMatch(id, initial);
      try {
        const running = referee(initial, "start");
        const competing = await Promise.all([
          saveMatch(id, 0, running, [], "start"),
          saveMatch(id, 0, running, [], "start"),
        ]);
        expect(competing.filter(Boolean)).toHaveLength(1);
        const row = await getMatch(id);
        expect(row?.revision).toBe(1);
        expect(row?.state).toEqual(running);
        const next = advance(running, 120);
        await saveMatch(id, 1, next, [next], "advance");
        expect((await getMatch(id))?.state.elapsedTicks).toBe(120);
        const chunks = await query(
          "SELECT revision,checkpoint FROM match_chunks WHERE match_id=$1 ORDER BY revision",
          [id],
        );
        expect(chunks).toHaveLength(2);
        expect(chunks[1].checkpoint).toEqual(next);
      } finally {
        await query("DELETE FROM match_chunks WHERE match_id=$1", [id]);
        await query("DELETE FROM matches WHERE id=$1", [id]);
      }
    });
  },
);
