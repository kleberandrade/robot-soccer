"use client";
import { LocalLink as Link } from "../i18n/client";

import { T } from "../i18n/client";

import dynamic from "next/dynamic";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import CameraView, { fieldCovered } from "./CameraView";
import RefereePanel from "./RefereePanel";
import ViewSettings from "./ViewSettings";
import { useMatchLab } from "./useMatchLab";
import { Configuration, RefereeDesk, Roster, time, teamName } from "./Panels";
const Arena = dynamic(() => import("./Arena"), {
  ssr: false,
  loading: () => (
    <div className="arena-loading">
      <T>{"Preparing 3D field…"}</T>
    </div>
  ),
});
export default function MatchLab() {
  const lab = useMatchLab();
  const { shown, row, message, trail, trails, setTrails, camera, rig } = lab;
  return (
    <main className="shell">
      <SiteHeader active="/lab" />
      <section className="lab-heading">
        <div>
          <p className="section-kicker">
            <T>{"SIMULATION LABORATORY"}</T>
          </p>
          <h1>
            <T>{"The match laboratory"}</T>
          </h1>
          <p>
            <T>
              {
                "Inspect the scene, test a strategy and manage the referee whistle."
              }
            </T>
          </p>
        </div>
        <Link href="/compete" className="site-button outline">
          <T>{"Private competition"}</T>
        </Link>
      </section>
      <section className="workspace" id="arena">
        <div className="match-column">
          <div className="arena-card">
            <div className="arena-top">
              <div>
                <span className="live-dot" />
                <T> </T>
                <strong>
                  <T>{row ? "SERVER MATCH" : "LOCAL PREVIEW"}</T>
                </strong>
                <span className="muted">
                  <T> </T>/{" "}
                  <T>{row ? "PostgreSQL checkpoints" : "not saved"}</T>
                </span>
              </div>
              <span className="phase">
                <T>{shown.phase}</T>
              </span>
            </div>
            <div className="scoreboard">
              <div className="team-name">
                <span className="team-dot blue" />
                <div>
                  <strong>
                    <T>{teamName(shown.strategies.blue).toUpperCase()}</T>
                  </strong>
                  <small>
                    <T>{shown.strategies.blue}</T>
                    <T>{"· blue team"}</T>
                  </small>
                </div>
              </div>
              <div className="score">
                <span>
                  <T>{shown.score.blue}</T>
                </span>
                <i>:</i>
                <span>
                  <T>{shown.score.yellow}</T>
                </span>
                <small>
                  <T>{time(shown.elapsedTicks)}</T>{" "}
                  <b>
                    H<T>{shown.period}</T>
                  </b>
                </small>
              </div>
              <div className="team-name away">
                <div>
                  <strong>
                    <T>{teamName(shown.strategies.yellow).toUpperCase()}</T>
                  </strong>
                  <small>
                    <T>{shown.strategies.yellow}</T>
                    <T>{"· yellow team"}</T>
                  </small>
                </div>
                <span className="team-dot yellow" />
              </div>
            </div>
            <div className="dual-arena">
              <section className="scene-pane">
                <div className="viewport-heading">
                  <strong>
                    <T>{"3D / INSPECT"}</T>
                  </strong>
                  <span>
                    <T>{"Orbit · zoom · spinning wheels"}</T>
                  </span>
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
                  <strong>
                    <T>{"2D / VIRTUAL CAMERA"}</T>
                  </strong>
                  <span>
                    <T>{camera.height.toFixed(1)}</T> m ·{" "}
                    <T>{camera.tiltDegrees}</T>
                    <T>{"° tilt"}</T>
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
                  <T>
                    {fieldCovered(shown, camera)
                      ? "Full field in frame"
                      : "Field cropped — adjust camera height / FOV"}
                  </T>
                </div>
              </section>
            </div>
            <div className="measurement-bar">
              <span>
                <T>{shown.config.length.toFixed(2)}</T> ×<T> </T>
                <T>{shown.config.width.toFixed(2)}</T>
                <T>{"m · goal"}</T>
                <T> </T>
                <T>{shown.config.goalWidth.toFixed(2)}</T> m
              </span>
              <span>
                <T>{"FRAME"}</T>
                <T>{shown.tick}</T>
                <T>{"· FIXED STEP 60 Hz"}</T>
              </span>
            </div>
            <div className="viewbar">
              <span>
                <T>{"Drag to orbit"}</T>
                <span className="muted">
                  <T>{"· Scroll to zoom"}</T>
                </span>
              </span>
              <div>
                <button
                  className="quiet"
                  aria-pressed={trails}
                  onClick={() => setTrails(!trails)}
                >
                  <T>{"Ball trail"}</T>
                </button>
              </div>
            </div>
          </div>
          <RefereeDesk lab={lab} />
          <div className="statusbar" role="status">
            <span className={row ? "connected" : "muted"}>
              ● <T>{row ? "Connected to server" : "Preview mode"}</T>
            </span>
            <span>
              <T>{message}</T>
            </span>
          </div>
        </div>
        <aside>
          <RefereePanel lab={lab} />
          <ViewSettings lab={lab} />
          <Roster state={shown} />
          <Configuration lab={lab} />
          <section className="note">
            <span>
              <T>{"THE LAB, NOT THE LEAGUE"}</T>
            </span>
            <p>
              <T>
                {
                  "Perfect simulated observations. Synthetic camera projection. Approximate contact physics. Competition rules and physical robots require separate validation."
                }
              </T>
            </p>
            <Link href="/docs">
              <T>{"Read the scope & assumptions"}</T>
            </Link>
          </section>
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}
