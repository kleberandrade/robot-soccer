"use client";

import { T, useI18n } from "../i18n/client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { type Team, type Decision } from "@robot-soccer/engine";
import { DEFAULT_CAMERA } from "@robot-soccer/engine/camera";
import CameraView from "./CameraView";
import { time } from "./Panels";
import {
  connectionSettings,
  downloadConnection,
  type usePrivateRoom,
} from "./usePrivateRoom";
const Arena = dynamic(() => import("./Arena"), {
  ssr: false,
  loading: () => (
    <div className="arena-loading">
      <T>{"Preparing 3D field…"}</T>
    </div>
  ),
});
type Lab = ReturnType<typeof usePrivateRoom>;
function InvitationCards({ lab }: { lab: Lab }) {
  if (!lab.invitations) return null;
  return (
    <section className="room-invitations">
      <h3>
        <T>{"Invite your participants"}</T>
      </h3>
      <p>
        <T>
          {
            "Share each code privately with its intended team. Each invitation claims one team only."
          }
        </T>
      </p>
      <div>
        {(["blue", "yellow"] as const).map((team) => (
          <article key={team}>
            <span>
              <T>{team}</T>
              <T>{"invitation"}</T>
            </span>
            <code>{lab.invitations![team].match(/.{1,4}/g)?.join("-")}</code>
          </article>
        ))}
      </div>
      <details>
        <summary>
          <T>{"Private spectator connection"}</T>
        </summary>
        <p>
          <T>{"Room ID:"}</T>
          <code>{lab.room?.id}</code>
        </p>
        <p>
          <T>{"Spectator key:"}</T>
          <T> </T>
          <code className="break-key">{lab.invitations.spectatorKey}</code>
        </p>
      </details>
    </section>
  );
}
function HostDesk({ lab }: { lab: Lab }) {
  const [kind, setKind] = useState<Decision["kind"]>("defensive-overload"),
    [team, setTeam] = useState<Team>("yellow");
  const r = lab.room!;
  return (
    <section className="room-host">
      <div>
        <span className="section-kicker">
          <T>{"HOST REFEREE DESK"}</T>
        </span>
        <h3>
          <T>
            {r.match.restart?.stage === "setup"
              ? `${r.match.restart.kind.replaceAll("-", " ")} · ${r.match.restart.team ?? "neutral"}`
              : "Manage the official match"}
          </T>
        </h3>
      </div>
      <div className="host-buttons">
        <button
          disabled={
            lab.busy || !["ready", "paused", "stoppage"].includes(r.match.phase)
          }
          onClick={() => lab.act("start")}
        >
          <T>{"Whistle / resume"}</T>
        </button>
        <button
          disabled={lab.busy || r.match.phase !== "running"}
          onClick={() => lab.act("pause")}
        >
          <T>{"Pause"}</T>
        </button>
        <button disabled={lab.busy} onClick={() => lab.act("reset")}>
          <T>{"Reset match"}</T>
        </button>
      </div>
      <details>
        <summary>
          <T>{"Make a referee decision"}</T>
        </summary>
        <div className="host-decision">
          <label>
            <T>{"Infraction"}</T>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Decision["kind"])}
            >
              <option value="defensive-overload">
                <T>{"Second defender involved"}</T>
              </option>
              <option value="attacking-overload">
                <T>{"Second attacker involved"}</T>
              </option>
              <option value="personal-foul">
                <T>{"Illegal pushing"}</T>
              </option>
              <option value="handling">
                <T>{"Illegal handling"}</T>
              </option>
              <option value="keeper-retention">
                <T>{"Keeper possession exceeds 10 seconds"}</T>
              </option>
              <option value="false-start">
                <T>{"False start"}</T>
              </option>
              <option value="free-ball">
                <T>{"Neutral free ball"}</T>
              </option>
            </select>
          </label>
          <label>
            <T>{"Offending team"}</T>
            <select
              value={team}
              onChange={(e) =>
                setTeam(e.target.value === "blue" ? "blue" : "yellow")
              }
            >
              <option value="blue">
                <T>{"Blue"}</T>
              </option>
              <option value="yellow">
                <T>{"Yellow"}</T>
              </option>
            </select>
          </label>
          <button
            disabled={lab.busy}
            onClick={() => lab.act("decision", { decision: { kind, team } })}
          >
            <T>{"Apply decision"}</T>
          </button>
        </div>
      </details>
    </section>
  );
}
export default function RoomDashboard({ lab }: { lab: Lab }) {
  const { locale } = useI18n();
  const [connectionText, setConnectionText] = useState("");
  const room = lab.room!,
    s = room.match,
    connection = lab.connection!;
  return (
    <section className="room-dashboard">
      <header className="room-heading">
        <div>
          <span className="section-kicker">
            <T>{"PRIVATE COMPETITION"}</T>
          </span>
          <h1>{room.name}</h1>
          <p>
            <T>{roleLabel(room.role)}</T>
            <T>{"· expires"}</T>
            <T> </T>
            <T>{new Date(room.expiresAt).toLocaleString(locale)}</T>
          </p>
        </div>
        <button onClick={() => downloadConnection(connection, room.role)}>
          <T>{"Save connection"}</T>
        </button>
      </header>
      <div className="room-save-note">
        <T>
          {
            "Save your connection before leaving. Keys stay in this browser's memory; refresh requires your saved key."
          }
        </T>
      </div>
      <details
        className="room-connection-settings"
        onToggle={(e) => {
          if (e.currentTarget.open)
            setConnectionText(connectionSettings(connection));
        }}
      >
        <summary>
          <T>{"Show private connection settings"}</T>
        </summary>
        <p>
          <T>{"If the download is unavailable, copy these settings into"}</T>
          <T> </T>
          <code>.env.room-{room.role}</code>
          <T>{". Keep this file private."}</T>
        </p>
        <pre>
          <code>{connectionText}</code>
        </pre>
      </details>
      <InvitationCards lab={lab} />
      <div className="room-score">
        <div>
          <span className="team-dot blue" />
          <strong>
            {room.participants.blue?.name ?? <T>Waiting for blue</T>}
          </strong>
          <small>
            <T>
              {room.participants.blue ? "Team claimed" : "Invitation not used"}
            </T>
          </small>
        </div>
        <div className="room-score-center">
          <strong>
            <T>{s.score.blue}</T> : <T>{s.score.yellow}</T>
          </strong>
          <span>
            <T>{time(s.elapsedTicks)}</T>
            <T>{"· Half"}</T>
            <T>{s.period}</T> · <T>{s.phase}</T>
          </span>
        </div>
        <div>
          <span className="team-dot yellow" />
          <strong>
            {room.participants.yellow?.name ?? <T>Waiting for yellow</T>}
          </strong>
          <small>
            <T>
              {room.participants.yellow
                ? "Team claimed"
                : "Invitation not used"}
            </T>
          </small>
        </div>
      </div>
      <div className="room-dual-arena">
        <section>
          <h3>
            <T>{"3D inspection"}</T>
          </h3>
          <div className="room-arena">
            <Arena state={s} trail={[]} camera={DEFAULT_CAMERA} rig={false} />
          </div>
        </section>
        <section>
          <h3>
            <T>{"Overhead camera"}</T>
            <span>
              <T>{"Frame"}</T>
              <T>{s.tick}</T>
            </span>
          </h3>
          <div className="room-camera">
            <CameraView state={s} camera={DEFAULT_CAMERA} />
          </div>
        </section>
      </div>
      <div className="room-turn-status">
        <span>
          <T>{"Turn"}</T>
          <T>{room.turn}</T>
        </span>
        <span>
          <T>{turnMessage(room)}</T>
        </span>
        <span>
          <T>{"6 physics ticks per complete turn"}</T>
        </span>
      </div>
      {room.role === "host" ? <HostDesk lab={lab} /> : null}
      <ProgramGuide role={room.role} />
      <section className="room-events">
        <h3>
          <T>{"Referee record"}</T>
        </h3>
        {s.officials.events
          .slice(-8)
          .reverse()
          .map((e) => (
            <p key={e.id}>
              <time>
                <T>{time(e.matchTick)}</T>
              </time>
              <span>
                <T>{e.message}</T>
              </span>
            </p>
          ))}
      </section>
    </section>
  );
}

function roleLabel(role: string) {
  if (role === "host") return "Host access";
  if (role === "spectator") return "Spectator access";
  return `${role} team access`;
}
function ProgramGuide({ role }: { role: string }) {
  if (role !== "blue" && role !== "yellow") return null;
  return (
    <section className="room-code-guide">
      <span className="section-kicker">
        <T>{"CONNECT YOUR PROGRAM"}</T>
      </span>
      <h3>
        <T>{"Keep your strategy on your computer."}</T>
      </h3>
      <p>
        <T>
          {
            "Save your connection above, place the downloaded file in your local project, then run either supplied example:"
          }
        </T>
      </p>
      <pre>
        <code>{`node --env-file=.env.room-${role} --import tsx examples/remote-team.ts koativa\nnode --env-file=.env.room-${role} --import tsx examples/remote-team.ts circuit`}</code>
      </pre>
      <p>
        <T>
          {
            "The host whistles when both teams are ready. Your program waits while the referee stops play. Keep the key private and outside Git."
          }
        </T>
      </p>
    </section>
  );
}

function turnMessage(room: NonNullable<Lab["room"]>) {
  return room.match.phase === "running"
    ? `Awaiting ${room.waitingFor.join(" and ")} commands`
    : "Waiting for the host referee";
}
