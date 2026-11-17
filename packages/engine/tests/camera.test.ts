import { it, expect } from "vitest";
import {
  projectPoint,
  cameraFootprint,
  DEFAULT_CAMERA,
  CameraSchema,
} from "../src/camera";
import { markersFor } from "../src/markers";
it("projects the field center to the frame center and preserves metric scale with camera height", () => {
  const origin = projectPoint({ x: 0, y: 0, z: 0 }, DEFAULT_CAMERA)!;
  expect(origin.u).toBe(0.5);
  expect(origin.v).toBe(0.5);
  expect(origin.depth).toBe(2);
  const near = projectPoint({ x: 0.3, y: 0, z: 0 }, DEFAULT_CAMERA)!,
    far = projectPoint(
      { x: 0.3, y: 0, z: 0 },
      { ...DEFAULT_CAMERA, height: 4 },
    )!;
  expect(near.u - 0.5).toBeCloseTo(2 * (far.u - 0.5), 12);
});
it("changes the projection with physical tilt and yaw and clips points behind the camera", () => {
  expect(
    projectPoint({ x: 0, y: 0, z: 0 }, { ...DEFAULT_CAMERA, tiltDegrees: 20 })!
      .v,
  ).toBeGreaterThan(0.5);
  const p = projectPoint(
    { x: 0.2, y: 0, z: 0 },
    { ...DEFAULT_CAMERA, yawDegrees: 90 },
  )!;
  expect(p.u).toBeCloseTo(0.5, 12);
  expect(p.v).toBeLessThan(0.5);
  expect(projectPoint({ x: 0, y: 0, z: 3 }, DEFAULT_CAMERA)).toBe(null);
  expect(() => CameraSchema.parse({ ...DEFAULT_CAMERA, height: 1 })).toThrow();
});
it("computes a ground footprint that reprojects to the camera image corners", () => {
  const camera = { ...DEFAULT_CAMERA, tiltDegrees: 15, yawDegrees: 25 },
    points = cameraFootprint(camera);
  expect(points).toHaveLength(4);
  const projected = points.map((p) => projectPoint({ ...p, z: 0 }, camera)!);
  for (const [i, p] of projected.entries()) {
    expect(p.u).toBeCloseTo([0, 1, 1, 0][i], 10);
    expect(p.v).toBeCloseTo([0, 0, 1, 1][i], 10);
  }
});
it("uses the same three metric tag patches for both views and unique nominal ID colors", () => {
  const zero = markersFor("blue-0"),
    one = markersFor("blue-1");
  expect(zero).toHaveLength(3);
  expect(zero[0].width).toBe(0.03);
  expect(zero[0].height).toBe(0.065);
  expect(zero[1].width).toBe(0.03);
  expect(zero[1].height).toBe(0.03);
  expect(zero).not.toEqual(one);
  for (const p of zero) {
    expect(Math.abs(p.x) + p.width / 2).toBeLessThanOrEqual(0.0325 + 1e-9);
    expect(Math.abs(p.y) + p.height / 2).toBeLessThanOrEqual(0.0325 + 1e-9);
  }
});
it("uses shared metric field markings and rotated roof patches", async () => {
  const { fieldLines, markerCorners } = await import("../src/field");
  const { CONFIG } = await import("../src/model");
  const lines = fieldLines(CONFIG);
  expect(lines[0][0]).toEqual(lines[0].at(-1));
  expect(lines[2][0].x).toBe(0.2);
  expect(lines.flat().some((p) => p.x === 0.375 && p.y === 0.025)).toBe(true);
  const corners = markerCorners(
    { x: 1, y: 2, angle: Math.PI / 2 },
    { x: 0.02, y: 0, width: 0.03, height: 0.06 },
  );
  expect(corners[0].x).toBeCloseTo(1.03, 10);
  expect(corners[0].y).toBeCloseTo(2.005, 10);
});
it("matches the analytic projection of a known 20-degree camera tilt", () => {
  const camera = { ...DEFAULT_CAMERA, tiltDegrees: 20 };
  const center = projectPoint({ x: 0, y: 0, z: 0 }, camera)!;
  expect(center.depth).toBeCloseTo(2 * Math.cos(Math.PI / 9), 12);
  expect(center.v).toBeCloseTo(
    0.5 + Math.tan(Math.PI / 9) / (2 * Math.tan((25 * Math.PI) / 180)),
    12,
  );
});
