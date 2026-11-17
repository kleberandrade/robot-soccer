"use client";
import dynamic from "next/dynamic";
import SiteHeader from "./SiteHeader";
import CameraView, { fieldCovered } from "./CameraView";
import RefereePanel from "./RefereePanel";
import ViewSettings from "./ViewSettings";
import { useMatchLab } from "./useMatchLab";
import { Configuration, RefereeDesk, Roster, time, teamName } from "./Panels";
const Arena = dynamic(() => import("./Arena"), {
  ssr: false,
  loading: () => <div className="arena-loading">Preparing 3D field…</div>,
});
export default function MatchLab() {
  const lab = useMatchLab();
  const { shown, row, message, trail, trails, setTrails, camera, rig } = lab;
  return (
    <main className="shell">
      <SiteHeader active="/lab" />
      <section className="lab-heading">
        <div>
          <p className="section-kicker">SIMULATION LABORATORY</p>
          <h1>The match laboratory</h1>
          <p>
            Inspect the scene, test a strategy and manage the referee whistle.
          </p>
        </div>
        <a href="/compete" className="site-button outline">
          Private competition
        </a>
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
                  <strong>
                    {teamName(shown.strategies.blue).toUpperCase()}
                  </strong>
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
                  <strong>
                    {teamName(shown.strategies.yellow).toUpperCase()}
                  </strong>
                  <small>{shown.strategies.yellow} · yellow team</small>
                </div>
                <span className="team-dot yellow" />
              </div>
            </div>
            <div className="dual-arena">
              <section className="scene-pane">
                <div className="viewport-heading">
                  <strong>3D / INSPECT</strong>
                  <span>Orbit · zoom · spinning wheels</span>
                </div>
                <div
                  className="arena-view"
                  aria-label="Live 3D robot soccer field"
                  data-testid="arena-3d"
                  data-tick={shown.tick}
                >
                  <Arena
                    state={shown}
                    trail={trails ? trail : []}
                    camera={camera}
                    rig={rig}
                  />
                </div>
              </section>
              <section className="camera-pane">
                <div className="viewport-heading">
                  <strong>2D / VIRTUAL CAMERA</strong>
                  <span>
                    {camera.height.toFixed(1)} m · {camera.tiltDegrees}° tilt
                  </span>
                </div>
                <div className="camera-view">
                  <CameraView state={shown} camera={camera} />
                </div>
                <div
                  className={
                    fieldCovered(shown, camera)
                      ? "coverage-ok"
                      : "coverage-warning"
                  }
                >
                  {fieldCovered(shown, camera)
                    ? "Full field in frame"
                    : "Field cropped — adjust camera height / FOV"}
                </div>
              </section>
            </div>
            <div className="measurement-bar">
              <span>
                {shown.config.length.toFixed(2)} ×{" "}
                {shown.config.width.toFixed(2)} m · goal{" "}
                {shown.config.goalWidth.toFixed(2)} m
              </span>
              <span>FRAME {shown.tick} · FIXED STEP 60 Hz</span>
            </div>
            <div className="viewbar">
              <span>
                Drag to orbit <span className="muted">· Scroll to zoom</span>
              </span>
              <div>
                <button
                  className="quiet"
                  aria-pressed={trails}
                  onClick={() => setTrails(!trails)}
                >
                  Ball trail
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
          <RefereePanel lab={lab} />
          <ViewSettings lab={lab} />
          <Roster state={shown} />
          <Configuration lab={lab} />
          <section className="note">
            <span>THE LAB, NOT THE LEAGUE</span>
            <p>
              Perfect simulated observations. Synthetic camera projection.
              Approximate contact physics. Competition rules and physical robots
              require separate validation.
            </p>
            <a href="/docs">Read the scope & assumptions </a>
          </section>
        </aside>
      </section>
      <footer>
        <span>
          ROBOT-SOCCER <b> / </b> Built to experiment.
        </span>
        <span>Origin: Fatec Americana · MIT · v0.3</span>
      </footer>
    </main>
  );
}
