"use client";
import { eventLabel, eventMessage, restartLabel } from "../i18n/events";

import { T, useI18n } from "../i18n/client";

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
  { kind: "defensive-overload", label: "Second defender involved (penalty)" },
  { kind: "keeper-retention", label: "Keeper possession exceeds 10 s" },
  { kind: "goalkeeper-push", label: "Pushing keeper without the ball" },
  { kind: "goalkeeper-block", label: "Blocking the goalkeeper" },
  { kind: "false-start", label: "False start before the whistle" },
  { kind: "free-ball", label: "Stalemate (neutral free ball)" },
];
function decisionLocked(lab: Lab) {
  return (
    lab.busy ||
    Boolean(lab.row && !lab.token) ||
    !["ready", "running", "paused", "stoppage"].includes(lab.shown.phase)
  );
}
export default function RefereePanel({ lab }: { lab: Lab }) {
  const { t, locale } = useI18n();
  const [kind, setKind] = useState<Decision["kind"]>("personal-foul"),
    [team, setTeam] = useState<Team>("blue"),
    [index, setIndex] = useState("0");
  const { shown, decide } = lab,
    locked = decisionLocked(lab);
  return (
    <section className="panel referee-panel">
      <div className="panel-heading">
        <span className="eyebrow">
          <T>{"02 / REFEREE"}</T>
        </span>
        <span className="pill">
          <T>
            {shown.config.automaticReferee
              ? "AUTO + OFFICIAL"
              : "OFFICIAL CALLS"}
          </T>
        </span>
      </div>
      <h2>
        <T>{"Fouls & restarts"}</T>
      </h2>
      <div className="foul-totals">
        <span>
          <T>{"Blue"}</T>
          <strong>
            <T>{shown.officials.fouls.blue}</T>
          </strong>
          <small>
            <T>{shown.officials.yellowCards.blue}</T>
            <T>{"yellow ·"}</T>
            <T>{shown.timeouts.blue}</T>/<T>{shown.config.timeoutLimit}</T>
            <T>{"timeouts"}</T>
          </small>
        </span>
        <span>
          <T>{"Yellow"}</T>
          <strong>
            <T>{shown.officials.fouls.yellow}</T>
          </strong>
          <small>
            <T>{shown.officials.yellowCards.yellow}</T>
            <T>{"yellow ·"}</T>
            <T> </T>
            <T>{shown.timeouts.yellow}</T>/<T>{shown.config.timeoutLimit}</T>
            <T>{"timeouts"}</T>
          </small>
        </span>
      </div>
      {shown.restart?.stage === "setup" ? (
        <p className="restart-call">
          <strong>
            {restartLabel(locale, shown.restart.kind).toLocaleUpperCase(locale)}
          </strong>
          <span>
            <T>{shown.restart.team ?? "Neutral ball"}</T>
            <T>{"· waiting for the referee whistle"}</T>
          </span>
        </p>
      ) : null}
      <ol className="event-list" aria-label={t("Recent referee events")}>
        {shown.officials.events
          .slice(-5)
          .reverse()
          .map((e) => (
            <li key={e.id}>
              <time>
                <T>{time(e.matchTick)}</T>
              </time>
              <div>
                <strong>{eventLabel(locale, e.kind)}</strong>
                <small>{eventMessage(locale, e)}</small>
              </div>
            </li>
          ))}
      </ol>
      <details className="official-controls">
        <summary>
          <T>{"Make a referee decision"}</T>
        </summary>
        <p className="help">
          <T>
            {
              "The human official has the final decision. This changes the restart, never individual wheel commands."
            }
          </T>
        </p>
        <label>
          <T>{"Infraction / decision"}</T>
          <select
            value={kind}
            onChange={(e) => {
              const selected = decisions.find((d) => d.kind === e.target.value);
              if (selected) setKind(selected.kind);
            }}
          >
            {decisions.map((d) => (
              <option key={d.kind} value={d.kind}>
                <T>{d.label}</T>
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
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
          <label>
            <T>{"Robot involved"}</T>
            <select value={index} onChange={(e) => setIndex(e.target.value)}>
              {["0", "1", "2"].map((id) => (
                <option key={id}>
                  <T>{id}</T>
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="full"
          disabled={locked}
          onClick={() => decide({ kind, team, robotId: `${team}-${index}` })}
        >
          <T>{"Apply referee decision"}</T>
        </button>
      </details>
    </section>
  );
}
