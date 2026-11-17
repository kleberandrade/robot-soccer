"use client";
import {
  CONFIG,
  USER_CONFIG,
  type Match,
  type Action,
  type Strategy,
} from "@robot-soccer/engine";
import type { Lab } from "./useMatchLab";
export const teamName = (strategy: Strategy) =>
  strategy === "balanced" ? "Koativa" : "Circuit";
export const time = (ticks: number) =>
  `${Math.floor(ticks / 3600)
    .toString()
    .padStart(
      2,
      "0",
    )}:${(Math.floor(ticks / 60) % 60).toString().padStart(2, "0")}`;
export function Configuration({ lab }: { lab: Lab }) {
  const {
    config,
    setConfig,
    strategies,
    setStrategies,
    busy,
    preview,
    token,
    setToken,
    connect,
    matchId,
    setMatchId,
    row,
  } = lab;
  return (
    <details className="panel config-panel">
      <summary>04 / Dimensions, teams & connection</summary>
      <label>
        Reference preset
        <select
          value={config.ruleset}
          onChange={(e) =>
            setConfig(
              e.target.value === "vsss-larc-reference"
                ? { ...CONFIG }
                : e.target.value === "user-reference"
                  ? { ...USER_CONFIG }
                  : { ...config, ruleset: "custom" },
            )
          }
        >
          <option value="vsss-larc-reference">
            VSSS / organizer-linked LARC reference
          </option>
          <option value="user-reference">
            Original user reference / 1.50 × 1.20 m
          </option>
          <option value="custom">Custom training configuration</option>
        </select>
      </label>
      <p className="help">
        Configuration applies to a new match. Preview is local; server matches
        use a dedicated PostgreSQL database.
      </p>
      <div className="form-grid">
        {(
          [
            "length",
            "width",
            "goalWidth",
            "robotSide",
            "robotHeight",
            "wheelBase",
            "wheelRadius",
            "motorAcceleration",
            "halfSeconds",
            "intervalSeconds",
            "timeoutSeconds",
          ] as const
        ).map((key) => (
          <label key={key}>
            {
              {
                length: "Length (m)",
                width: "Width (m)",
                goalWidth: "Goal mouth (m)",
                robotSide: "Robot side (m)",
                robotHeight: "Robot height (m)",
                wheelBase: "Axle track (m)",
                wheelRadius: "Wheel radius (m)",
                motorAcceleration: "Wheel acceleration (m/s²)",
                halfSeconds: "Half (s)",
                intervalSeconds: "Interval (s)",
                timeoutSeconds: "Timeout (s)",
              }[key]
            }
            <input
              type="number"
              step={key.endsWith("Seconds") ? 1 : 0.001}
              value={config[key]}
              onChange={(e) =>
                setConfig({
                  ...config,
                  ruleset: "custom",
                  [key]: Number(e.target.value),
                })
              }
            />
          </label>
        ))}
      </div>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={config.automaticReferee}
          onChange={(e) =>
            setConfig({ ...config, automaticReferee: e.target.checked })
          }
        />
        Automatic referee (simulated contact thresholds)
      </label>
      {(["blue", "yellow"] as const).map((team) => (
        <label key={team}>
          {team} strategy
          <select
            value={strategies[team]}
            onChange={(e) =>
              setStrategies({
                ...strategies,
                [team]: e.target.value as Strategy,
              })
            }
          >
            <option value="balanced">Koativa / balanced roles</option>
            <option value="press">Circuit / supporting attack</option>
          </select>
        </label>
      ))}
      <button disabled={busy} onClick={preview}>
        Apply to preview
      </button>
      <label>
        Operator token
        <input
          type="password"
          autoComplete="off"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Server token · never stored"
        />
      </label>
      <button
        className="primary full"
        disabled={busy || token.length < 32}
        onClick={() => connect()}
      >
        Create server match
      </button>
      <label>
        Existing match ID
        <input
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          placeholder="UUID"
        />
      </label>
      <button disabled={busy || !matchId} onClick={() => connect(true)}>
        Connect / spectate
      </button>
      {row ? (
        <a
          className="replay-link"
          href={`/api/matches/${row.id}/replay`}
          target="_blank"
          rel="noreferrer"
        >
          Open replay chunks ↗
        </a>
      ) : null}
    </details>
  );
}
export function Roster({ state }: { state: Match }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">01 / LINEUP</span>
        <span className="pill">AUTONOMOUS</span>
      </div>
      <h2>Meet the teams</h2>
      {(["blue", "yellow"] as const).map((team) => (
        <div className="roster" key={team}>
          <div className="roster-title">
            <span className={`team-dot ${team}`} />
            <strong>{teamName(state.strategies[team])}</strong>
            <span>{team.toUpperCase()}</span>
          </div>
          {state.robots
            .filter((r) => r.team === team)
            .map((r) => (
              <div className="robot-row" key={r.id}>
                <span className={`number ${team}`}>{r.id.slice(-1)}</span>
                <span>{r.role}</span>
                <code>
                  {r.excludedUntil !== null
                    ? "EXCLUDED"
                    : `${((r.left + r.right) / 2).toFixed(2)} m/s`}
                </code>
              </div>
            ))}
        </div>
      ))}
    </section>
  );
}
export function RefereeDesk({ lab }: { lab: Lab }) {
  const { shown, busy, row, token, action } = lab;
  const locked = busy || Boolean(row && !token);
  const buttons = refereeButtons(shown, locked);
  return (
    <div className="controls-card">
      <div>
        <p className="eyebrow">REFEREE DESK</p>
        <p>{phaseMessage(shown)}</p>
      </div>
      <div className="controls">
        {buttons.map(([key, label, disabled], i) => (
          <button
            key={key}
            className={i === 0 ? "primary" : undefined}
            disabled={disabled}
            onClick={() => action(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
function phaseMessage(s: Match) {
  if (s.phase === "stoppage" && s.restart)
    return `${s.restart.kind.replaceAll("-", " ")} for ${s.restart.team ?? "both teams"} · press Whistle to resume`;
  if (s.phase === "halftime")
    return `Interval · ${time(s.phaseTicks)} / ${time(s.config.intervalSeconds * 60)}`;
  if (s.phase === "timeout")
    return `Technical timeout · ${time(s.phaseTicks)} / ${time(s.config.timeoutSeconds * 60)}`;
  return "Teams drive autonomously. You manage the match.";
}

function refereeButtons(shown: Match, locked: boolean) {
  const active = shown.phase === "running";
  const buttons: [Action, string, boolean][] = [
    [
      active ? "pause" : "start",
      active
        ? "Ⅱ Pause"
        : shown.phase === "stoppage"
          ? "▶ Whistle / resume"
          : "▶ Start match",
      locked ||
        !["ready", "paused", "running", "stoppage"].includes(shown.phase),
    ],
    ["reset", "↺ Reset", locked],
    [
      "timeout-blue",
      "Blue timeout",
      locked || !active || shown.timeouts.blue >= shown.config.timeoutLimit,
    ],
    [
      "timeout-yellow",
      "Yellow timeout",
      locked || !active || shown.timeouts.yellow >= shown.config.timeoutLimit,
    ],
  ];
  return buttons;
}
