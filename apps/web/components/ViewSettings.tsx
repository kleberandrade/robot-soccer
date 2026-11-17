"use client";
import type { Lab } from "./useMatchLab";
import { DEFAULT_CAMERA } from "@robot-soccer/engine/camera";
export default function ViewSettings({ lab }: { lab: Lab }) {
  const { camera, setCamera, rig, setRig, shown } = lab;
  return (
    <section className="panel view-settings">
      <div className="panel-heading">
        <span className="eyebrow">03 / CAMERA & DRIVE</span>
        <span className="pill">METERS / DEGREES</span>
      </div>
      <h2>One state. Two views.</h2>
      <p className="help">
        Virtual camera fixed over midfield. The 2D sensor projection follows its
        height, angle and field of view.
      </p>
      <div className="form-grid">
        {(
          [
            { key: "height", label: "Height (m)", min: 2, max: 6, step: 0.1 },
            {
              key: "tiltDegrees",
              label: "Tilt (°)",
              min: -35,
              max: 35,
              step: 1,
            },
            {
              key: "yawDegrees",
              label: "Yaw (°)",
              min: -180,
              max: 180,
              step: 5,
            },
            {
              key: "verticalFov",
              label: "Vertical FOV (°)",
              min: 30,
              max: 90,
              step: 1,
            },
          ] as const
        ).map((f) => (
          <label key={f.key}>
            {f.label}
            <input
              type="number"
              min={f.min}
              max={f.max}
              step={f.step}
              value={camera[f.key]}
              onChange={(e) =>
                setCamera({ ...camera, [f.key]: Number(e.target.value) })
              }
            />
          </label>
        ))}
      </div>
      <div className="camera-actions">
        <button
          className="quiet"
          onClick={() => setCamera({ ...DEFAULT_CAMERA })}
        >
          Reset camera
        </button>
        <button
          className="quiet"
          aria-pressed={rig}
          onClick={() => setRig(!rig)}
        >
          {rig ? "Frame field" : "Show camera rig"}
        </button>
      </div>
      <p className="drive-spec">
        Robot {Math.round(shown.config.robotSide * 1000)} ×{" "}
        {Math.round(shown.config.robotSide * 1000)} mm · axle{" "}
        {Math.round(shown.config.wheelBase * 1000)} mm · wheel Ø{" "}
        {Math.round(shown.config.wheelRadius * 2000)} mm
      </p>
      <p className="help">
        Zoom the 3D view to inspect the two wheels. Their phases come from
        integrated wheel travel; the drive model limits acceleration.
      </p>
      <div className="tag-legend">
        {["0", "1", "2"].map((id, i) => (
          <span key={id}>
            ID {id}
            <i style={{ background: i === 2 ? "#00bd36" : "#df2027" }} />
            <i
              style={{
                background:
                  i === 0 ? "#00bd36" : i === 1 ? "#00bccc" : "#df2027",
              }}
            />
          </span>
        ))}
      </div>
    </section>
  );
}
