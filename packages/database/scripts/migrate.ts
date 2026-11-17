import { readFile, readdir } from "node:fs/promises";
import { query } from "../src/index";
await query(
  "CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())",
);
for (const name of (await readdir("db/migrations"))
  .filter((n) => n.endsWith(".sql"))
  .sort()) {
  const applied = await query(
    "SELECT name FROM schema_migrations WHERE name=$1",
    [name],
  );
  if (applied.length) continue;
  // Deployment migration is a single operator task. DDL is idempotent after interruption.
  for (const statement of (await readFile(`db/migrations/${name}`, "utf8"))
    .split(";")
    .filter((s) => s.trim()))
    await query(statement);
  await query(
    "INSERT INTO schema_migrations(name) VALUES($1) ON CONFLICT DO NOTHING",
    [name],
  );
  console.log("Applied migration:", name);
}
await query(await readFile("db/seed.sql", "utf8"));
console.log("Seed complete");
