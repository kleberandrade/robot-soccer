"use client";
import { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { markersFor } from "@robot-soccer/engine/markers";
function CadPart({
  file,
  z,
  color,
  xray,
}: {
  file: string;
  z: number;
  color: string;
  xray: boolean;
}) {
  const geometry = useLoader(STLLoader, `/hardware/case/${file}.stl`);
  return (
    <mesh geometry={geometry} position={[0, 0, z]}>
      <meshStandardMaterial
        color={color}
        roughness={0.7}
        metalness={0.05}
        transparent={xray}
        opacity={xray ? 0.2 : 1}
        depthWrite={!xray}
      />
    </mesh>
  );
}
function Assembly({ exploded, xray }: { exploded: boolean; xray: boolean }) {
  const deck = exploded ? 45 : 0,
    lid = exploded ? 55 : 0;
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} scale={0.001}>
      <CadPart file="tray" z={4} color="#263b41" xray={xray} />
      <CadPart
        file="electronics-deck"
        z={30 + deck}
        color="#c5b89b"
        xray={xray}
      />
      <CadPart file="lid" z={63 + lid} color="#607f78" xray={xray} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[0, side * 32.5, 16]}>
            <cylinderGeometry args={[16, 16, 7, 48]} />
            <meshStandardMaterial color="#182026" roughness={0.9} />
          </mesh>
          <mesh position={[0, side * 15, 16]}>
            <boxGeometry args={[12, 26, 10]} />
            <meshStandardMaterial
              color="#b6aa8f"
              metalness={0.35}
              roughness={0.5}
            />
          </mesh>
          <mesh position={[0, side * 32, 16]}>
            <cylinderGeometry args={[1.5, 1.5, 8, 16]} />
            <meshStandardMaterial
              color="#b7bec2"
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[-20.5, 0, 17]}>
        <boxGeometry args={[25, 45, 18]} />
        <meshStandardMaterial color="#7492a2" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 36.4 + deck]}>
        <boxGeometry args={[45, 40, 1.6]} />
        <meshStandardMaterial color="#286d54" roughness={0.6} />
      </mesh>
      {[-27, 27].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <CadPart file="skid" z={0} color="#c7ccbf" xray={false} />
        </group>
      ))}
      {markersFor("blue-0").map((m, i) => (
        <mesh key={i} position={[m.x * 1000, m.y * 1000, 65.15 + lid]}>
          <planeGeometry args={[m.width * 1000, m.height * 1000]} />
          <meshBasicMaterial color={m.color} />
        </mesh>
      ))}
    </group>
  );
}
export default function CaseScene({
  exploded,
  xray,
}: {
  exploded: boolean;
  xray: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0.16, 0.145, 0.18], fov: 40 }}
      dpr={[1, 1.5]}
      fallback={
        <p className="case-fallback">
          3D unavailable. Open the dimension drawing or STL files below.
        </p>
      }
    >
      <color attach="background" args={["#e8eeea"]} />
      <ambientLight intensity={1.8} />
      <directionalLight position={[0.1, 0.25, 0.2]} intensity={3} />
      <Suspense fallback={null}>
        <Assembly exploded={exploded} xray={xray} />
      </Suspense>
      <gridHelper args={[0.22, 22, "#b7c8bf", "#d1ddd5"]} />
      <OrbitControls
        makeDefault
        target={[0, exploded ? 0.06 : 0.035, 0]}
        minDistance={0.09}
        maxDistance={0.5}
      />
    </Canvas>
  );
}
