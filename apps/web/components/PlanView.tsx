import { DEFAULT_CAMERA } from "@robot-soccer/engine/camera";
import type { Match } from "@robot-soccer/engine";
import CameraView from "./CameraView";
export default function PlanView({ state }: { state: Match }) {
  return <CameraView state={state} camera={DEFAULT_CAMERA} />;
}
