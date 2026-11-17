"use client";
import { useI18n } from "../i18n/client";
import { BALL_RADIUS, isActive, type Match } from "@robot-soccer/engine";
import { projectPoint, type CameraConfig } from "@robot-soccer/engine/camera";
import {
  fieldOutline,
  robotCorners,
  type Point,
} from "@robot-soccer/engine/geometry";
import { fieldLines, markerCorners } from "@robot-soccer/engine/field";
import { markersFor } from "@robot-soccer/engine/markers";
export function fieldCovered(state: Match, camera: CameraConfig) {
  return fieldOutline(state.config).every((p) => {
    const q = projectPoint({ ...p, z: 0 }, camera);
    return q !== null && q.u >= 0 && q.u <= 1 && q.v >= 0 && q.v <= 1;
  });
}
function imagePoint(p: Point, z: number, c: CameraConfig) {
  const v = projectPoint({ ...p, z }, c);
  return v ? `${(v.u * 800).toFixed(4)},${(v.v * 600).toFixed(4)}` : "";
}
function polygon(points: Point[], z: number, c: CameraConfig) {
  return points.map((p) => imagePoint(p, z, c)).join(" ");
}
export default function CameraView({
  state,
  camera,
}: {
  state: Match;
  camera: CameraConfig;
}) {
  const { t, locale } = useI18n();
  const c = state.config,
    ball = projectPoint({ ...state.ball, z: BALL_RADIUS }, camera),
    radius = ball
      ? (600 * BALL_RADIUS) /
        (2 * ball.depth * Math.tan((camera.verticalFov * Math.PI) / 360))
      : 0;
  const robots = state.robots
    .filter(isActive)
    .sort(
      (a, b) =>
        (projectPoint({ ...b, z: c.robotHeight }, camera)?.depth ?? 0) -
        (projectPoint({ ...a, z: c.robotHeight }, camera)?.depth ?? 0),
    );
  return (
    <svg
      viewBox="0 0 800 600"
      className="camera-frame"
      role="img"
      aria-label={`${t("Synthetic camera view")}, ${t("Frame")} ${state.tick}, ${t("Height")} ${new Intl.NumberFormat(locale).format(camera.height)} ${t("meters")}`}
      data-testid="camera-view"
      data-tick={state.tick}
    >
      <defs>
        <clipPath id="sensor-frame">
          <rect width="800" height="600" />
        </clipPath>
      </defs>
      <rect width="800" height="600" fill="#17232b" />
      <g clipPath="url(#sensor-frame)">
        <polygon points={polygon(fieldOutline(c), 0, camera)} fill="#101317" />
        {[-1, 1].map((sign) => (
          <polygon
            key={sign}
            points={polygon(
              [
                { x: (sign * c.length) / 2, y: -c.goalWidth / 2 },
                { x: sign * (c.length / 2 + c.goalDepth), y: -c.goalWidth / 2 },
                { x: sign * (c.length / 2 + c.goalDepth), y: c.goalWidth / 2 },
                { x: (sign * c.length) / 2, y: c.goalWidth / 2 },
              ],
              0,
              camera,
            )}
            fill="#090c0f"
            stroke="#7f8c90"
            strokeWidth="1"
          />
        ))}
        {fieldLines(c).map((points, i) => (
          <polyline
            key={i}
            points={polygon(points, 0.001, camera)}
            fill="none"
            stroke="#dce2dc"
            strokeWidth="1.2"
          />
        ))}
        {robots.map((r) => (
          <g key={r.id}>
            <title>{`${r.id} · ${t(r.role)}`}</title>
            <polygon
              points={polygon(robotCorners(r, c), c.robotHeight, camera)}
              fill="#030405"
              stroke="#53616c"
              strokeWidth=".6"
            />
            {markersFor(r.id).map((m, i) => (
              <polygon
                key={i}
                points={polygon(
                  markerCorners(r, m),
                  c.robotHeight + 0.001,
                  camera,
                )}
                fill={m.color}
              />
            ))}
          </g>
        ))}
        {ball ? (
          <circle
            cx={(ball.u * 800).toFixed(4)}
            cy={(ball.v * 600).toFixed(4)}
            r={radius.toFixed(4)}
            fill="#ff781f"
            stroke="#ffc27d"
            strokeWidth=".6"
          />
        ) : null}
      </g>
      <path
        d="M400 286 V314 M386 300 H414"
        stroke="#9bb1b0"
        strokeWidth="1"
        opacity=".4"
      />
    </svg>
  );
}
