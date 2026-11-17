import { LocalLink as Link } from "../../../i18n/client";
import { getTranslator } from "../../../i18n/server";
import { localizeDocument } from "../../../i18n/documents";

import { T } from "../../../i18n/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import HardwareTables from "../../../components/HardwareTables";
import DocumentLayout from "../../../components/DocumentLayout";
import MarkdownContent from "../../../components/MarkdownContent";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: t("Hardware reference | ROBOTSOCCER"),
    description: t(
      "Explore the ESP32-C3 robot envelope, original wiring diagram, component budget, pin map and firmware reference.",
    ),
  };
}
export default async function Hardware() {
  const t = await getTranslator();
  const text = await readFile(
    path.resolve(process.cwd(), "../../hardware/README.md"),
    "utf8",
  );
  return (
    <DocumentLayout active="/hardware" label="HARDWARE REFERENCE">
      <div className="document-title">
        <span className="section-kicker">
          <T>{"ESP32-C3 REFERENCE PLATFORM"}</T>
        </span>
        <h1>
          <T>{"Inside the robot."}</T>
        </h1>
        <p>
          <T>
            {
              "Dimensions, power, wiring and code for a compact two-wheel design."
            }
          </T>
        </p>
      </div>
      <div className="document-banner">
        <span>
          <T>{"DESIGN REFERENCE"}</T>
        </span>
        <p>
          <T>
            {
              "Original electrical and mechanical proposal · not a manufactured robot"
            }
          </T>
        </p>
      </div>
      <section className="hardware-explore-links">
        <Link href="/hardware/electronics">
          <span>
            <T>{"ELECTRONICS"}</T>
          </span>
          <strong>
            <T>{"Follow the complete connection diagram."}</T>
          </strong>
          <small>
            <T>{"Power rails, module pads, driver pins and programming."}</T>
          </small>
        </Link>
        <Link href="/hardware/case">
          <span>
            <T>{"MECHANICAL DESIGN"}</T>
          </span>
          <strong>
            <T>{"Explore the case in 3D."}</T>
          </strong>
          <small>
            <T>{"Exploded assembly, dimensions and editable STL source."}</T>
          </small>
        </Link>
        <Link href="/hardware/firmware">
          <span>
            <T>{"ROBOT CODE"}</T>
          </span>
          <strong>
            <T>{"Read the actual ESP32 firmware."}</T>
          </strong>
          <small>
            <T>{"Full source, build setup and the bounded command parser."}</T>
          </small>
        </Link>
      </section>
      <section className="hardware-resources">
        <a href="/hardware/wiring.svg">
          <T>{"Wiring diagram"}</T>
          <small>
            <T>{"Open full-size SVG"}</T>
          </small>
        </a>
        <a href="/hardware/bom.csv" download>
          <T>{"Component list"}</T>
          <small>
            <T>{"Download BOM"}</T>
          </small>
        </a>
        <a href="/hardware/pinmap.csv" download>
          <T>{"GPIO pin map"}</T>
          <small>
            <T>{"Download CSV"}</T>
          </small>
        </a>
      </section>
      <div className="wiring-preview">
        <object
          type="image/svg+xml"
          data="/hardware/electronics.svg"
          aria-label={t("Original ESP32-C3 wiring diagram")}
        >
          <a href="/hardware/wiring.svg">
            <T>{"View wiring diagram"}</T>
          </a>
        </object>
      </div>
      <article className="article-body">
        <MarkdownContent>
          {(await localizeDocument("hardware", text)).replace(/^# /, "## ")}
        </MarkdownContent>
      </article>
      <HardwareTables />
    </DocumentLayout>
  );
}
