"use client";
import { Component, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
const CaseScene = dynamic(() => import("./CaseScene"), {
  ssr: false,
  loading: () => (
    <div className="case-fallback">Preparing the CAD assembly…</div>
  ),
});
class CaseGuard extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="case-fallback">
        The 3D preview could not load. The drawing and STL downloads remain
        available.
      </p>
    ) : (
      this.props.children
    );
  }
}
export default function CaseExplorer() {
  const [exploded, setExploded] = useState(false),
    [xray, setXray] = useState(false);
  return (
    <section className="case-explorer">
      <div className="case-toolbar">
        <div>
          <strong>PARAMETRIC CASE / REV A</strong>
          <span>Drag to orbit · scroll to zoom</span>
        </div>
        <div>
          <button
            aria-pressed={exploded}
            onClick={() => setExploded(!exploded)}
          >
            Exploded view
          </button>
          <button aria-pressed={xray} onClick={() => setXray(!xray)}>
            See through shell
          </button>
        </div>
      </div>
      <div
        className="case-canvas"
        aria-label="Interactive 3D robot case assembly"
      >
        <CaseGuard>
          <CaseScene exploded={exploded} xray={xray} />
        </CaseGuard>
      </div>
      <div className="case-legend">
        <span>
          <i style={{ background: "#263b41" }} />
          Tray
        </span>
        <span>
          <i style={{ background: "#c5b89b" }} />
          Removable deck
        </span>
        <span>
          <i style={{ background: "#607f78" }} />
          Marker lid
        </span>
        <span>
          <i style={{ background: "#7492a2" }} />
          Battery keepout
        </span>
        <span>
          <i style={{ background: "#286d54" }} />
          Carrier budget
        </span>
      </div>
    </section>
  );
}
