"use client";
import dynamic from "next/dynamic";
import Plan from "./PlanView";
import { useMatchLab, type Lab } from "./useMatchLab";
import { Configuration, RefereeDesk, Roster, time } from "./Panels";
const Arena = dynamic(() => import("./Arena"), {
  ssr: false,
  loading: () => <div className="arena-loading">Preparing 3D field…</div>,
});
export default function MatchLab() {
  const lab = useMatchLab();
  const { shown, row, message, plan, trail, trails, setTrails, setPlan } = lab;
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">
            R<span>·</span>S
          </span>{" "}
          ROBOT-SOCCER
        </a>
        <nav aria-label="Main navigation">
          <a className="selected" href="#arena">
            Match lab
          </a>
          <a href="https://github.com/kleberandrade/robot-soccer#readme">
            Documentation ↗
          </a>
          <a href="https://github.com/kleberandrade/robot-soccer/tree/master/hardware">
            Hardware ↗
          </a>
        </nav>
        <span className="edition">VSSS / 3 × 3</span>
      </header>
      <section className="intro">
        <div>
          <p className="eyebrow">AUTONOMOUS ROBOTICS / OPEN LABORATORY</p>
          <h1>
            Small robots.
            <br />
            <span>Big match energy.</span>
          </h1>
          <p className="intro-copy">
            Build a team. Test a strategy. Watch six autonomous robots find
            their way to goal.
          </p>
        </div>
        <div className="intro-stat">
          <strong>06</strong>
          <span>ROBOTS ON THE FIELD</span>
          <small>One ball. Two teams. No human driving.</small>
        </div>
      </section>
      <section className="workspace" id="arena">
        <div className="match-column">
          <div className="arena-card">
            <div className="arena-top">
              <div>
                <span className="live-dot" />{" "}
                <strong>{row ? "SERVER MATCH" : "LOCAL PREVIEW"}</strong>
                <span className="muted">
                  {" "}
                  / {row ? "PostgreSQL checkpoints" : "not saved"}
                </span>
              </div>
              <span className="phase">{shown.phase}</span>
            </div>
            <div className="scoreboard">
              <div className="team-name">
                <span className="team-dot blue" />
                <div>
                  <strong>AMERICANA</strong>
                  <small>{shown.strategies.blue} · blue team</small>
                </div>
              </div>
              <div className="score">
                <span>{shown.score.blue}</span>
                <i>:</i>
                <span>{shown.score.yellow}</span>
                <small>
                  {time(shown.elapsedTicks)} <b>H{shown.period}</b>
                </small>
              </div>
              <div className="team-name away">
                <div>
                  <strong>CIRCUIT</strong>
                  <small>{shown.strategies.yellow} · yellow team</small>
                </div>
                <span className="team-dot yellow" />
              </div>
            </div>
            <div className="arena-view" aria-label="Live robot soccer field">
              {plan ? (
                <Plan state={shown} />
              ) : (
                <Arena state={shown} trail={trails ? trail : []} />
              )}
              <div className="arena-legend">
                {shown.config.length.toFixed(2)} ×{" "}
                {shown.config.width.toFixed(2)} m <span>FIXED STEP 60 Hz</span>
              </div>
            </div>
            <div className="viewbar">
              <span>
                ↔ Drag to orbit <span className="muted">· Scroll to zoom</span>
              </span>
              <div>
                <button
                  className="quiet"
                  aria-pressed={trails}
                  onClick={() => setTrails(!trails)}
                >
                  Ball trail
                </button>
                <button
                  className="quiet"
                  aria-pressed={plan}
                  onClick={() => setPlan(!plan)}
                >
                  {plan ? "3D view" : "2D fallback"}
                </button>
              </div>
            </div>
          </div>
          <RefereeDesk lab={lab} />
          <div className="statusbar" role="status">
            <span className={row ? "connected" : "muted"}>
              ● {row ? "Connected to server" : "Preview mode"}
            </span>
            <span>{message}</span>
          </div>
        </div>
        <aside>
          <Roster state={shown} />
          <Configuration lab={lab} />
          <section className="note">
            <span>THE LAB, NOT THE LEAGUE</span>
            <p>
              Perfect simulated observations. Approximate contact physics.
              Competition rules and physical robots require separate validation.
            </p>
            <a href="https://github.com/kleberandrade/robot-soccer/tree/master/docs">
              Read the scope & assumptions ↗
            </a>
          </section>
        </aside>
      </section>
      <footer>
        <span>
          ROBOT-SOCCER <b> / </b> Built to experiment.
        </span>
        <span>Origin: Fatec Americana · MIT · v0.1</span>
      </footer>
    </main>
  );
}
