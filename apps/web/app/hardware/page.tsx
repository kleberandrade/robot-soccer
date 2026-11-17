import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import HardwareTables from "../../components/HardwareTables";
import DocumentLayout from "../../components/DocumentLayout";
import MarkdownContent from "../../components/MarkdownContent";
export const metadata: Metadata = {
  title: "Hardware reference | ROBOTSOCCER",
  description:
    "Explore the ESP32-C3 robot envelope, original wiring diagram, component budget, pin map and firmware reference.",
};
export default async function Hardware() {
  const text = await readFile(
    path.resolve(process.cwd(), "../../hardware/README.md"),
    "utf8",
  );
  return (
    <DocumentLayout active="/hardware" label="HARDWARE REFERENCE">
      <div className="document-title">
        <span className="section-kicker">ESP32-C3 REFERENCE PLATFORM</span>
        <h1>Inside the robot.</h1>
        <p>
          Dimensions, power, wiring and code for a compact two-wheel design.
        </p>
      </div>
      <div className="document-banner">
        <span>DESIGN REFERENCE</span>
        <p>
          Original electrical and mechanical proposal · not a manufactured robot
        </p>
      </div>
      <section className="hardware-explore-links">
        <a href="/hardware/electronics">
          <span>ELECTRONICS</span>
          <strong>Follow the complete connection diagram.</strong>
          <small>Power rails, module pads, driver pins and programming.</small>
        </a>
        <a href="/hardware/case">
          <span>MECHANICAL DESIGN</span>
          <strong>Explore the case in 3D.</strong>
          <small>Exploded assembly, dimensions and editable STL source.</small>
        </a>
        <a href="/hardware/firmware">
          <span>ROBOT CODE</span>
          <strong>Read the actual ESP32 firmware.</strong>
          <small>
            Full source, build setup and the bounded command parser.
          </small>
        </a>
      </section>
      <section className="hardware-resources">
        <a href="/hardware/wiring.svg">
          Wiring diagram <small>Open full-size SVG</small>
        </a>
        <a href="/hardware/bom.csv" download>
          Component list <small>Download BOM</small>
        </a>
        <a href="/hardware/pinmap.csv" download>
          GPIO pin map <small>Download CSV</small>
        </a>
      </section>
      <div className="wiring-preview">
        <object
          type="image/svg+xml"
          data="/hardware/electronics.svg"
          aria-label="Original ESP32-C3 wiring diagram"
        >
          <a href="/hardware/wiring.svg">View wiring diagram</a>
        </object>
      </div>
      <article className="article-body">
        <MarkdownContent>{text.replace(/^# /, "## ")}</MarkdownContent>
      </article>
      <HardwareTables />
    </DocumentLayout>
  );
}
