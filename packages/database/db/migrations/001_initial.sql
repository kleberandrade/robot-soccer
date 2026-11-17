CREATE TABLE IF NOT EXISTS teams (
 slug text PRIMARY KEY,
 name text NOT NULL,
 strategy text NOT NULL CHECK (strategy IN ('balanced','press'))
);
CREATE TABLE IF NOT EXISTS matches (
 id uuid PRIMARY KEY,
 revision integer NOT NULL DEFAULT 0 CHECK (revision>=0),
 state jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS match_chunks (
 match_id uuid NOT NULL REFERENCES matches(id),
 revision integer NOT NULL,
 action text NOT NULL,
 frames jsonb NOT NULL,
 checkpoint jsonb NOT NULL,
 PRIMARY KEY(match_id,revision)
);
