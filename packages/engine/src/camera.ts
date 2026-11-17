import { z } from "zod";
export const DEFAULT_CAMERA = {
  height: 2,
  tiltDegrees: 0,
  yawDegrees: 0,
  verticalFov: 50,
  aspect: 4 / 3,
};
export const CameraSchema = z
  .object({
    height: z.number().min(2).max(6),
    tiltDegrees: z.number().min(-35).max(35),
    yawDegrees: z.number().min(-180).max(180),
    verticalFov: z.number().min(30).max(90),
    aspect: z.number().min(0.5).max(2),
  })
  .strict();
export type CameraConfig = z.infer<typeof CameraSchema>;
type Vec3 = { x: number; y: number; z: number };
function basis(c: CameraConfig) {
  const tilt = (c.tiltDegrees * Math.PI) / 180,
    yaw = (c.yawDegrees * Math.PI) / 180;
  return {
    forward: {
      x: Math.sin(tilt) * Math.sin(yaw),
      y: Math.sin(tilt) * Math.cos(yaw),
      z: -Math.cos(tilt),
    },
    right: { x: Math.cos(yaw), y: -Math.sin(yaw), z: 0 },
    up: {
      x: Math.sin(yaw) * Math.cos(tilt),
      y: Math.cos(yaw) * Math.cos(tilt),
      z: Math.sin(tilt),
    },
  };
}
function dot(a: Vec3, b: Vec3) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
export function projectPoint(point: Vec3, c: CameraConfig) {
  const { forward, right, up } = basis(c),
    relative = { x: point.x, y: point.y, z: point.z - c.height },
    depth = dot(relative, forward);
  if (depth <= 0.001) return null;
  const scale = 2 * depth * Math.tan((c.verticalFov * Math.PI) / 360);
  return {
    u: 0.5 + dot(relative, right) / (scale * c.aspect),
    v: 0.5 - dot(relative, up) / scale,
    depth,
  };
}
export function cameraFootprint(c: CameraConfig) {
  const { forward, right, up } = basis(c),
    t = Math.tan((c.verticalFov * Math.PI) / 360);
  return [
    [-1, 1],
    [1, 1],
    [1, -1],
    [-1, -1],
  ].flatMap(([x, y]) => {
    const ray = {
      x: forward.x + x * t * c.aspect * right.x + y * t * up.x,
      y: forward.y + x * t * c.aspect * right.y + y * t * up.y,
      z: forward.z + y * t * up.z,
    };
    if (ray.z >= -0.001) return [];
    const length = -c.height / ray.z;
    return [{ x: ray.x * length, y: ray.y * length }];
  });
}
