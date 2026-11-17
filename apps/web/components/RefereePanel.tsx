"use client";
import { useState } from "react";
import { type Decision, type Team } from "@robot-soccer/engine";
import type { Lab } from "./useMatchLab";
import { time } from "./Panels";
const decisions: { kind: Decision["kind"]; label: string }[] = [
  { kind: "personal-foul", label: "Illegal contact / pushing" },
  { kind: "handling", label: "Illegal ball retention" },
  {
    kind: "attacking-overload",
    label: "Second attacker involved in goal area",
  },
  { kind: "defensive-overload", label: "Second defender involved → penalty" },
  { kind: "keeper-retention", label: "Keeper possession exceeds 10 s" },
  { kind: "goalkeeper-push", label: "Pushing keeper without the ball" },
  { kind: "goalkeeper-block", label: "Blocking the goalkeeper" },
  { kind: "false-start", label: "False start before the whistle" },
  { kind: "free-ball", label: "Stalemate → neutral free ball" },
];
function decisionLocked(lab: Lab) {
  return (
    lab.busy ||
    Boolean(lab.row && !lab.token) ||
    !["ready", "running", "paused", "stoppage"].includes(lab.shown.phase)
  );
}
export default function RefereePanel({ lab }: { lab: Lab }) {
  const [kind, setKind] = useState<Decision["kind"]>("personal-foul"),
    [team, setTeam] = useState<Team>("blue"),
    [index, setIndex] = useState("0");
  const { shown, decide } = lab,
    locked = decisionLocked(lab);
  return (
    <section className="panel referee-panel">
      <div className="panel-heading">
        <span className="eyebrow">02 / REFEREE</span>
        <span className="pill">
          {shown.config.automaticReferee ? "AUTO + OFFICIAL" : "OFFICIAL CALLS"}
        </span>
      </div>
      <h2>Fouls & restarts</h2>
      <div className="foul-totals">
        <span>
          Blue <strong>{shown.officials.fouls.blue}</strong>
          <small>
            {shown.officials.yellowCards.blue} yellow · {shown.timeouts.blue}/
            {shown.config.timeoutLimit} timeouts
          </small>
        </span>
        <span>
          Yellow <strong>{shown.officials.fouls.yellow}</strong>
          <small>
            {shown.officials.yellowCards.yellow} yellow ·{" "}
            {shown.timeouts.yellow}/{shown.config.timeoutLimit} timeouts
          </small>
        </span>
      </div>
      {shown.restart?.stage === "setup" ? (
        <p className="restart-call">
          <strong>
            {shown.restart.kind.replaceAll("-", " ").toUpperCase()}
          </strong>
          <span>
            {shown.restart.team ?? "Neutral ball"} · waiting for the referee
            whistle
          </span>
        </p>
      ) : null}
      <ol className="event-list" aria-label="Recent referee events">
        {shown.officials.events
          .slice(-5)
          .reverse()
          .map((e) => (
            <li key={e.id}>
              <time>{time(e.matchTick)}</time>
              <div>
                <strong>{e.kind.replaceAll("-", " ")}</strong>
                <small>{e.message}</small>
              </div>
            </li>
          ))}
      </ol>
      <details className="official-controls">
        <summary>Make a referee decision</summary>
        <p className="help">
          The human official has the final decision. This changes the restart,
          never individual wheel commands.
        </p>
        <label>
          Infraction / decision
          <select
            value={kind}
            onChange={(e) => {
              const selected = decisions.find((d) => d.kind === e.target.value);
              if (selected) setKind(selected.kind);
            }}
          >
            {decisions.map((d) => (
              <option key={d.kind} value={d.kind}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
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
          <label>
            Robot involved
            <select value={index} onChange={(e) => setIndex(e.target.value)}>
              {["0", "1", "2"].map((id) => (
                <option key={id}>{id}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="full"
          disabled={locked}
          onClick={() => decide({ kind, team, robotId: `${team}-${index}` })}
        >
          Apply referee decision
        </button>
      </details>
    </section>
  );
}
