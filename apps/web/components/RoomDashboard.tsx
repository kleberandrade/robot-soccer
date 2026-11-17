"use client";
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
  loading: () => <div className="arena-loading">Preparing 3D field…</div>,
});
type Lab = ReturnType<typeof usePrivateRoom>;
function InvitationCards({ lab }: { lab: Lab }) {
  if (!lab.invitations) return null;
  return (
    <section className="room-invitations">
      <h3>Invite your participants</h3>
      <p>
        Share each code privately with its intended team. Each invitation claims
        one team only.
      </p>
      <div>
        {(["blue", "yellow"] as const).map((team) => (
          <article key={team}>
            <span>{team} invitation</span>
            <code>{lab.invitations![team].match(/.{1,4}/g)?.join("-")}</code>
          </article>
        ))}
      </div>
      <details>
        <summary>Private spectator connection</summary>
        <p>
          Room ID: <code>{lab.room?.id}</code>
        </p>
        <p>
          Spectator key:{" "}
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
        <span className="section-kicker">HOST REFEREE DESK</span>
        <h3>
          {r.match.restart?.stage === "setup"
            ? `${r.match.restart.kind.replaceAll("-", " ")} · ${r.match.restart.team ?? "neutral"}`
            : "Manage the official match"}
        </h3>
      </div>
      <div className="host-buttons">
        <button
          disabled={
            lab.busy || !["ready", "paused", "stoppage"].includes(r.match.phase)
          }
          onClick={() => lab.act("start")}
        >
          Whistle / resume
        </button>
        <button
          disabled={lab.busy || r.match.phase !== "running"}
          onClick={() => lab.act("pause")}
        >
          Pause
        </button>
        <button disabled={lab.busy} onClick={() => lab.act("reset")}>
          Reset match
        </button>
      </div>
      <details>
        <summary>Make a referee decision</summary>
        <div className="host-decision">
          <label>
            Infraction
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Decision["kind"])}
            >
              <option value="defensive-overload">
                Second defender involved
              </option>
              <option value="attacking-overload">
                Second attacker involved
              </option>
              <option value="personal-foul">Illegal pushing</option>
              <option value="handling">Illegal handling</option>
              <option value="keeper-retention">
                Keeper possession exceeds 10 seconds
              </option>
              <option value="false-start">False start</option>
              <option value="free-ball">Neutral free ball</option>
            </select>
          </label>
          <label>
            Offending team
            <select
              value={team}
              onChange={(e) =>
                setTeam(e.target.value === "blue" ? "blue" : "yellow")
              }
            >
              <option value="blue">Blue</option>
              <option value="yellow">Yellow</option>
            </select>
          </label>
          <button
            disabled={lab.busy}
            onClick={() => lab.act("decision", { decision: { kind, team } })}
          >
            Apply decision
          </button>
        </div>
      </details>
    </section>
  );
}
export default function RoomDashboard({ lab }: { lab: Lab }) {
  const [connectionText, setConnectionText] = useState("");
  const room = lab.room!,
    s = room.match,
    connection = lab.connection!;
  return (
    <section className="room-dashboard">
      <header className="room-heading">
        <div>
          <span className="section-kicker">PRIVATE COMPETITION</span>
          <h1>{room.name}</h1>
          <p>
            {roleLabel(room.role)} · expires{" "}
            {new Date(room.expiresAt).toLocaleString()}
          </p>
        </div>
        <button onClick={() => downloadConnection(connection, room.role)}>
          Save connection
        </button>
      </header>
      <div className="room-save-note">
        Save your connection before leaving. Keys stay in this browser's memory;
        refresh requires your saved key.
      </div>
      <details
        className="room-connection-settings"
        onToggle={(e) => {
          if (e.currentTarget.open)
            setConnectionText(connectionSettings(connection));
        }}
      >
        <summary>Show private connection settings</summary>
        <p>
          If the download is unavailable, copy these settings into{" "}
          <code>.env.room-{room.role}</code>. Keep this file private.
        </p>
        <pre>
          <code>{connectionText}</code>
        </pre>
      </details>
      <InvitationCards lab={lab} />
      <div className="room-score">
        <div>
          <span className="team-dot blue" />
          <strong>{room.participants.blue?.name ?? "Waiting for blue"}</strong>
          <small>
            {room.participants.blue ? "Team claimed" : "Invitation not used"}
          </small>
        </div>
        <div className="room-score-center">
          <strong>
            {s.score.blue} : {s.score.yellow}
          </strong>
          <span>
            {time(s.elapsedTicks)} · Half {s.period} · {s.phase}
          </span>
        </div>
        <div>
          <span className="team-dot yellow" />
          <strong>
            {room.participants.yellow?.name ?? "Waiting for yellow"}
          </strong>
          <small>
            {room.participants.yellow ? "Team claimed" : "Invitation not used"}
          </small>
        </div>
      </div>
      <div className="room-dual-arena">
        <section>
          <h3>3D inspection</h3>
          <div className="room-arena">
            <Arena state={s} trail={[]} camera={DEFAULT_CAMERA} rig={false} />
          </div>
        </section>
        <section>
          <h3>
            Overhead camera <span>Frame {s.tick}</span>
          </h3>
          <div className="room-camera">
            <CameraView state={s} camera={DEFAULT_CAMERA} />
          </div>
        </section>
      </div>
      <div className="room-turn-status">
        <span>Turn {room.turn}</span>
        <span>{turnMessage(room)}</span>
        <span>6 physics ticks per complete turn</span>
      </div>
      {room.role === "host" ? <HostDesk lab={lab} /> : null}
      <ProgramGuide role={room.role} />
      <section className="room-events">
        <h3>Referee record</h3>
        {s.officials.events
          .slice(-8)
          .reverse()
          .map((e) => (
            <p key={e.id}>
              <time>{time(e.matchTick)}</time>
              <span>{e.message}</span>
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
      <span className="section-kicker">CONNECT YOUR PROGRAM</span>
      <h3>Keep your strategy on your computer.</h3>
      <p>
        Save your connection above, place the downloaded file in your local
        project, then run either supplied example:
      </p>
      <pre>
        <code>{`node --env-file=.env.room-${role} --import tsx examples/remote-team.ts koativa\nnode --env-file=.env.room-${role} --import tsx examples/remote-team.ts circuit`}</code>
      </pre>
      <p>
        The host whistles when both teams are ready. Your program waits while
        the referee stops play. Keep the key private and outside Git.
      </p>
    </section>
  );
}

function turnMessage(room: NonNullable<Lab["room"]>) {
  return room.match.phase === "running"
    ? `Awaiting ${room.waitingFor.join(" and ")} commands`
    : "Waiting for the host referee";
}
