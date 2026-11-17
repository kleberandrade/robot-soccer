"use client";
import { useState } from "react";
import type { usePrivateRoom } from "./usePrivateRoom";
type Lab = ReturnType<typeof usePrivateRoom>;
export default function RoomEntry({ lab }: { lab: Lab }) {
  const [mode, setMode] = useState<"join" | "create" | "resume">("join"),
    [code, setCode] = useState(""),
    [name, setName] = useState(""),
    [operator, setOperator] = useState(""),
    [id, setId] = useState(""),
    [key, setKey] = useState("");
  return (
    <section className="room-entry">
      <div className="entry-tabs" role="tablist" aria-label="Room access">
        {(["join", "create", "resume"] as const).map((m) => (
          <button
            role="tab"
            key={m}
            aria-selected={mode === m}
            onClick={() => setMode(m)}
          >
            {m === "join"
              ? "Join a team"
              : m === "create"
                ? "Create a room"
                : "Reconnect"}
          </button>
        ))}
      </div>
      {mode === "join" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void lab.join(code, name);
          }}
        >
          <h2>Take your place on the field.</h2>
          <p>
            Use the private team invitation supplied by the host. Blue and
            yellow have separate invitations.
          </p>
          <label>
            Team invitation
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ABCD-EFGH-JKLM-NPQR"
              autoComplete="off"
              minLength={16}
              maxLength={24}
              required
            />
          </label>
          <label>
            Your team name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Koativa"
              maxLength={40}
              required
            />
          </label>
          <button className="site-button solid" disabled={lab.busy}>
            Join private room
          </button>
        </form>
      ) : null}
      {mode === "create" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void lab.create(name, operator);
            setOperator("");
          }}
        >
          <h2>A private match, on your terms.</h2>
          <p>
            Create a room with separate invitations for each participant. Only
            the host manages the referee whistle.
          </p>
          <label>
            Competition name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Friday robotics practice"
              maxLength={60}
              required
            />
          </label>
          <label>
            Server operator token
            <input
              type="password"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              autoComplete="off"
              required
              minLength={32}
            />
          </label>
          <small>
            Room creation requires the server operator. Participants receive
            their own private team access.
          </small>
          <button className="site-button solid" disabled={lab.busy}>
            Create private room
          </button>
        </form>
      ) : null}
      {mode === "resume" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void lab.connect({ id, key });
          }}
        >
          <h2>Return to your competition.</h2>
          <p>
            Use the room ID and your saved host, team or spectator key. No key
            is added to the page address.
          </p>
          <label>
            Room ID
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <label>
            Private connection key
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <button className="site-button solid" disabled={lab.busy}>
            Reconnect to room
          </button>
        </form>
      ) : null}
    </section>
  );
}
