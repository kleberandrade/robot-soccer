"use client";

import { T, useI18n } from "../i18n/client";

import { useState } from "react";
import type { usePrivateRoom } from "./usePrivateRoom";
type Lab = ReturnType<typeof usePrivateRoom>;
export default function RoomEntry({ lab }: { lab: Lab }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"join" | "create" | "resume">("join"),
    [code, setCode] = useState(""),
    [name, setName] = useState(""),
    [operator, setOperator] = useState(""),
    [id, setId] = useState(""),
    [key, setKey] = useState("");
  return (
    <section className="room-entry">
      <div className="entry-tabs" role="tablist" aria-label={t("Room access")}>
        {(["join", "create", "resume"] as const).map((m) => (
          <button
            role="tab"
            key={m}
            aria-selected={mode === m}
            onClick={() => setMode(m)}
          >
            <T>
              {m === "join"
                ? "Join a team"
                : m === "create"
                  ? "Create a room"
                  : "Reconnect"}
            </T>
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
          <h2>
            <T>{"Take your place on the field."}</T>
          </h2>
          <p>
            <T>
              {
                "Use the private team invitation supplied by the host. Blue and yellow have separate invitations."
              }
            </T>
          </p>
          <label>
            <T>{"Team invitation"}</T>
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
            <T>{"Your team name"}</T>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Koativa"
              maxLength={40}
              required
            />
          </label>
          <button className="site-button solid" disabled={lab.busy}>
            <T>{"Join private room"}</T>
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
          <h2>
            <T>{"A private match, on your terms."}</T>
          </h2>
          <p>
            <T>
              {
                "Create a room with separate invitations for each participant. Only the host manages the referee whistle."
              }
            </T>
          </p>
          <label>
            <T>{"Competition name"}</T>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("Friday robotics practice")}
              maxLength={60}
              required
            />
          </label>
          <label>
            <T>{"Server operator token"}</T>
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
            <T>
              {
                "Room creation requires the server operator. Participants receive their own private team access."
              }
            </T>
          </small>
          <button className="site-button solid" disabled={lab.busy}>
            <T>{"Create private room"}</T>
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
          <h2>
            <T>{"Return to your competition."}</T>
          </h2>
          <p>
            <T>
              {
                "Use the room ID and your saved host, team or spectator key. No key is added to the page address."
              }
            </T>
          </p>
          <label>
            <T>{"Room ID"}</T>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <label>
            <T>{"Private connection key"}</T>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <button className="site-button solid" disabled={lab.busy}>
            <T>{"Reconnect to room"}</T>
          </button>
        </form>
      ) : null}
    </section>
  );
}
