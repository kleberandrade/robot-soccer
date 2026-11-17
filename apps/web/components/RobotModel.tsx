"use client";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import { type Robot, type Config } from "@robot-soccer/engine";
import { markersFor } from "@robot-soccer/engine/markers";
function Wheel({
  side,
  phase,
  tick,
  config,
}: {
  side: number;
  phase: number;
  tick: number;
  config: Config;
}) {
  const ref = useRef<Group>(null),
    target = useRef(-phase),
    lastTick = useRef(tick);
  target.current = -phase;
  const snap = useRef(false),
    initial = useRef(-phase);
  if (tick < lastTick.current) snap.current = true;
  lastTick.current = tick;
  useEffect(() => {
    if (ref.current) ref.current.rotation.z = initial.current;
  }, []);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.z = snap.current
        ? target.current
        : MathUtils.damp(ref.current.rotation.z, target.current, 28, dt);
      snap.current = false;
    }
  });
  const radius = config.wheelRadius,
    thickness = 0.006;
  return (
    <group position={[0, radius, (side * config.wheelBase) / 2]}>
      <group ref={ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius, radius, thickness, 24]} />
          <meshStandardMaterial color="#242c33" roughness={0.9} />
        </mesh>
        {[0, Math.PI / 2].map((a) => (
          <mesh
            key={a}
            position={[0, 0, side * (thickness / 2 + 0.0005)]}
            rotation={[0, 0, a]}
          >
            <boxGeometry args={[radius * 1.7, 0.002, 0.001]} />
            <meshStandardMaterial color="#c1c9c4" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
export default function RobotModel({
  robot: r,
  config: c,
  tick,
}: {
  robot: Robot;
  config: Config;
  tick: number;
}) {
  const clearance = 0.007,
    bodyHeight = c.robotHeight - clearance;
  return (
    <group name={r.id} position={[r.x, 0, r.y]} rotation={[0, -r.angle, 0]}>
      <mesh position={[0, clearance + bodyHeight / 2, 0]}>
        <boxGeometry args={[c.robotSide, bodyHeight, c.robotSide - 0.012]} />
        <meshStandardMaterial color="#080d12" roughness={0.85} />
      </mesh>
      <mesh position={[0, c.robotHeight - 0.001, 0]}>
        <boxGeometry args={[c.robotSide, 0.002, c.robotSide]} />
        <meshStandardMaterial color="#070b0e" />
      </mesh>
      {markersFor(r.id).map((m, i) => (
        <mesh
          key={i}
          position={[m.x, c.robotHeight + 0.0006, m.y]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[m.width, m.height]} />
          <meshBasicMaterial color={m.color} />
        </mesh>
      ))}
      <Wheel side={1} phase={r.leftRotation} tick={tick} config={c} />
      <Wheel side={-1} phase={r.rightRotation} tick={tick} config={c} />
    </group>
  );
}
