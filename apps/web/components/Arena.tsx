"use client";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { Component, useEffect, type ReactNode } from "react";
import { BALL_RADIUS, isActive, type Match } from "@robot-soccer/engine";
import {
  cameraFootprint,
  type CameraConfig,
} from "@robot-soccer/engine/camera";
import PlanView from "./PlanView";
import RobotModel from "./RobotModel";
import FieldModel from "./FieldModel";
function ViewCamera({
  state,
  rig,
  camera,
}: {
  state: Match;
  rig: boolean;
  camera: CameraConfig;
}) {
  const { camera: view } = useThree(),
    scale = Math.max(state.config.length, state.config.width);
  useEffect(() => {
    if (rig) view.position.set(scale * 1.4, camera.height * 1.3, scale * 1.6);
    else view.position.set(scale * 0.72, scale * 1.1, scale * 0.82);
    view.lookAt(0, rig ? camera.height * 0.45 : 0, 0);
    view.updateProjectionMatrix();
  }, [view, scale, rig, camera.height]);
  return (
    <OrbitControls
      makeDefault
      minDistance={0.18}
      maxDistance={10}
      target={[0, rig ? camera.height * 0.45 : 0, 0]}
      maxPolarAngle={Math.PI / 2.05}
    />
  );
}
function CameraRig({ camera }: { camera: CameraConfig }) {
  const footprint = cameraFootprint(camera),
    height = camera.height;
  return (
    <>
      <group
        position={[0, height, 0]}
        rotation={[
          (-camera.tiltDegrees * Math.PI) / 180,
          (camera.yawDegrees * Math.PI) / 180,
          0,
        ]}
      >
        <mesh>
          <boxGeometry args={[0.12, 0.05, 0.08]} />
          <meshStandardMaterial color="#b3f2bf" />
        </mesh>
        <mesh position={[0, -0.035, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.03, 20]} />
          <meshStandardMaterial color="#111b23" />
        </mesh>
      </group>
      {footprint.map((p, i) => (
        <Line
          key={i}
          points={[
            [0, height, 0],
            [p.x, 0.007, p.y],
          ]}
          color="#8edca4"
          transparent
          opacity={0.22}
          lineWidth={1}
        />
      ))}
      {footprint.length === 4 ? (
        <Line
          points={[...footprint, footprint[0]].map((p) => [p.x, 0.007, p.y])}
          color="#8edca4"
          transparent
          opacity={0.4}
        />
      ) : null}
    </>
  );
}
function Scene({
  state,
  trail,
  camera,
  rig,
}: {
  state: Match;
  trail: [number, number][];
  camera: CameraConfig;
  rig: boolean;
}) {
  return (
    <>
      <ambientLight intensity={2} />
      <directionalLight position={[1, 3, 2]} intensity={3} />
      <FieldModel config={state.config} />
      {trail.length > 1 ? (
        <Line
          points={trail.map(([x, y]) => [x, 0.009, y])}
          color="#ff9f58"
          transparent
          opacity={0.5}
        />
      ) : null}
      <mesh position={[state.ball.x, BALL_RADIUS, state.ball.y]}>
        <sphereGeometry args={[BALL_RADIUS, 24, 16]} />
        <meshStandardMaterial color="#ff781f" />
      </mesh>
      {state.robots.filter(isActive).map((r) => (
        <RobotModel
          key={r.id}
          robot={r}
          config={state.config}
          tick={state.tick}
        />
      ))}
      <CameraRig camera={camera} />
      <ViewCamera state={state} camera={camera} rig={rig} />
    </>
  );
}
class Guard extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export default function Arena({
  state,
  trail,
  camera,
  rig,
}: {
  state: Match;
  trail: [number, number][];
  camera: CameraConfig;
  rig: boolean;
}) {
  return (
    <Guard fallback={<PlanView state={state} />}>
      <Canvas
        camera={{ position: [1.15, 1.65, 1.3], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        fallback={<PlanView state={state} />}
      >
        <Scene state={state} trail={trail} camera={camera} rig={rig} />
      </Canvas>
    </Guard>
  );
}
