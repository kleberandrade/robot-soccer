CREATE TABLE IF NOT EXISTS competition_rooms (
 id uuid PRIMARY KEY,
 revision integer NOT NULL DEFAULT 0 CHECK (revision>=0),
 state jsonb NOT NULL,
 host_hash text NOT NULL,
 spectator_hash text NOT NULL,
 blue_invite_hash text NOT NULL UNIQUE,
 yellow_invite_hash text NOT NULL UNIQUE,
 blue_key_hash text,
 yellow_key_hash text,
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
