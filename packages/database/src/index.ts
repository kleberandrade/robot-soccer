import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import { hydrateMatch,type Match } from "@robot-soccer/engine";
export type MatchRow = { id: string; revision: number; state: Match };
export async function query(
  text: string,
  params: unknown[] = [],
): Promise<Record<string, unknown>[]> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  if (new URL(url).hostname.endsWith(".neon.tech"))
    return neon(url).query(text, params);
  if (process.env.NODE_ENV === "production")
    throw new Error("Production requires a dedicated Neon database");
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    return (await pool.query(text, params)).rows;
  } finally {
    await pool.end();
  }
}
export async function insertMatch(id: string, state: Match): Promise<MatchRow> {
  const rows = await query(
    "INSERT INTO matches(id,state) VALUES($1,$2::jsonb) RETURNING id,revision,state",
    [id, JSON.stringify(state)],
  );
  return rows[0] as MatchRow;
}
export async function getMatch(id: string): Promise<MatchRow | undefined> {
  const row=(await query("SELECT id,revision,state FROM matches WHERE id=$1",[id]))[0];
  if(!row)return undefined;
  if(typeof row.id!=='string'||typeof row.revision!=='number')throw new Error('Invalid persisted match row');
  return {id:row.id,revision:row.revision,state:hydrateMatch(row.state)};
}
export async function saveMatch(
  id: string,
  revision: number,
  state: Match,
  frames: Match[],
  action: string,
): Promise<MatchRow | undefined> {
  // The conditional update and replay insertion are a single atomic SQL statement.
  const rows = await query(
    `WITH changed AS (
 UPDATE matches SET state=$3::jsonb,revision=revision+1,updated_at=now()
 WHERE id=$1 AND revision=$2 RETURNING id,revision,state
 ), chunk AS (
 INSERT INTO match_chunks(match_id,revision,action,frames,checkpoint)
 SELECT id,revision,$5,$4::jsonb,state FROM changed
 ) SELECT id,revision,state FROM changed`,
    [id, revision, JSON.stringify(state), JSON.stringify(frames), action],
  );
  return rows[0] as MatchRow | undefined;
}
