"use client";

import { T, useI18n } from "../i18n/client";

import { Component, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
const CaseScene = dynamic(() => import("./CaseScene"), {
  ssr: false,
  loading: () => (
    <div className="case-fallback">
      <T>{"Preparing the CAD assembly…"}</T>
    </div>
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
        <T>
          {
            "The 3D preview could not load. The drawing and STL downloads remain available."
          }
        </T>
      </p>
    ) : (
      this.props.children
    );
  }
}
export default function CaseExplorer() {
  const { t } = useI18n();
  const [exploded, setExploded] = useState(false),
    [xray, setXray] = useState(false);
  return (
    <section className="case-explorer">
      <div className="case-toolbar">
        <div>
          <strong>
            <T>{"PARAMETRIC CASE / REV A"}</T>
          </strong>
          <span>
            <T>{"Drag to orbit · scroll to zoom"}</T>
          </span>
        </div>
        <div>
          <button
            aria-pressed={exploded}
            onClick={() => setExploded(!exploded)}
          >
            <T>{"Exploded view"}</T>
          </button>
          <button aria-pressed={xray} onClick={() => setXray(!xray)}>
            <T>{"See through shell"}</T>
          </button>
        </div>
      </div>
      <div
        className="case-canvas"
        aria-label={t("Interactive 3D robot case assembly")}
      >
        <CaseGuard>
          <CaseScene exploded={exploded} xray={xray} />
        </CaseGuard>
      </div>
      <div className="case-legend">
        <span>
          <i style={{ background: "#263b41" }} />
          <T>{"Tray"}</T>
        </span>
        <span>
          <i style={{ background: "#c5b89b" }} />
          <T>{"Removable deck"}</T>
        </span>
        <span>
          <i style={{ background: "#607f78" }} />
          <T>{"Marker lid"}</T>
        </span>
        <span>
          <i style={{ background: "#7492a2" }} />
          <T>{"Battery keepout"}</T>
        </span>
        <span>
          <i style={{ background: "#286d54" }} />
          <T>{"Carrier budget"}</T>
        </span>
      </div>
    </section>
  );
}
