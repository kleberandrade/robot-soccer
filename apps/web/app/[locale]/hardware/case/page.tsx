import { getTranslator } from "../../../../i18n/server";
import { getLocale } from "../../../../i18n/server";

import { T } from "../../../../i18n/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import MarkdownContent from "../../../../components/MarkdownContent";
import type { Metadata } from "next";
import Image from "next/image";
import { LocalLink as Link } from "../../../../i18n/client";
import SiteHeader from "../../../../components/SiteHeader";
import SiteFooter from "../../../../components/SiteFooter";
import CaseExplorer from "../../../../components/CaseExplorer";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: t("Robot case design | ROBOTSOCCER"),
    description: t(
      "Inspect a parametric 70 mm robot case in 3D, explore its assembly and download closed-manifold STL concept files.",
    ),
  };
}
export default async function CasePage() {
  const t = await getTranslator();
  const locale = await getLocale();
  const guideName = {
    "pt-BR": "GUIA-IMPRESSAO-E-MONTAGEM.md",
    en: "PRINTING-AND-ASSEMBLY.md",
    es: "GUIA-IMPRESION-Y-MONTAJE.md",
  }[locale];
  const guide = await readFile(
    path.resolve(process.cwd(), "public/hardware/case", guideName),
    "utf8",
  );
  return (
    <div className="public-site">
      <SiteHeader active="/hardware" />
      <main className="hardware-wide">
        <Link className="breadcrumb" href="/hardware">
          <T>{"Hardware reference / Case design"}</T>
        </Link>
        <header className="hardware-page-title">
          <span className="section-kicker">
            <T>{"MECHANICAL DESIGN / CONCEPT REV A"}</T>
          </span>
          <h1>
            <T>{"A compact home"}</T>
            <br />
            <T>{"for the whole robot."}</T>
          </h1>
          <p>
            <T>
              {
                "Inspect the actual generated STL parts, separate the lid and electronics deck, and check the dimension budget before building."
              }
            </T>
          </p>
        </header>
        <div className="document-banner">
          <span>
            <T>{"UNBUILT DESIGN"}</T>
          </span>
          <p>
            <T>
              {
                "The meshes are geometrically checked. Fit, printing, loads, center of mass and physical competition inspection remain unverified."
              }
            </T>
          </p>
        </div>
        <section
          className="case-bundle"
          aria-label={t("Pacote completo do case")}
        >
          <div>
            <h2>
              <T>{"Todas as peças, um único download."}</T>
            </h2>
            <p>
              <T>
                {
                  "Quatro STL em milímetros, guia didático em português, desenho cotado e fonte CAD editável. Protótipo Rev A, ainda sem impressão ou montagem física validadas."
                }
              </T>
            </p>
          </div>
          <div>
            <a
              className="site-button"
              href="/hardware/case/robot-soccer-case-rev-a.zip"
              download
            >
              <T>{"Baixar todos os STL + guia (ZIP)"}</T>
            </a>
            <a className="case-guide-link" href="#guia-impressao">
              <T>{"Ler o guia de impressão e montagem"}</T>
            </a>
          </div>
        </section>
        <CaseExplorer />
        <div className="case-specs">
          <article>
            <span>
              <T>{"CASE"}</T>
            </span>
            <strong>
              <T>{"70 × 70 mm"}</T>
            </strong>
            <p>
              <T>
                {
                  "Shell footprint. A 2 mm lid closes the assembly at 65 mm height above the ground plane."
                }
              </T>
            </p>
          </article>
          <article>
            <span>
              <T>{"DRIVE"}</T>
            </span>
            <strong>
              <T>{"72 mm tire span"}</T>
            </strong>
            <p>
              <T>
                {
                  "65 mm wheel track + 7 mm wheel width. Measure actual hubs and shaft ends against the 75 mm bare envelope."
                }
              </T>
            </p>
          </article>
          <article>
            <span>
              <T>{"PACKAGING"}</T>
            </span>
            <strong>
              <T>{"25 × 45 × 18 mm"}</T>
            </strong>
            <p>
              <T>
                {
                  "Maximum battery keepout, behind the motors. A removable deck holds a proposed 45 × 40 mm carrier above it."
                }
              </T>
            </p>
          </article>
        </div>
        <section className="hardware-article">
          <h2>
            <T>{"Built as a serviceable stack"}</T>
          </h2>
          <ol>
            <li>
              <strong>
                <T>{"Lower tray."}</T>
              </strong>
              <T>
                {
                  "A 2 mm floor, 1.6 mm side walls, open wheel windows, nominal N20 locating rails and strap slots. Four corner columns support the removable deck and lid."
                }
              </T>
            </li>
            <li>
              <strong>
                <T>{"Electronics deck."}</T>
              </strong>
              <T>
                {
                  "The 65.8 mm plate drops over the corner columns and rests at 30 mm. It has cable slots and four provisional PCB standoffs on a 39 × 34 mm hole pattern."
                }
              </T>
            </li>
            <li>
              <strong>
                <T>{"Marker lid."}</T>
              </strong>
              <T>
                {
                  "A flat top supports the 65 mm tag layout. Recessed fastener positions avoid deliberately projecting screw heads above the marker plane. Adapt them to the selected screws."
                }
              </T>
            </li>
            <li>
              <strong>
                <T>{"Passive skids."}</T>
              </strong>
              <T>
                {
                  "Optional separate support pads; adjust their contact height and friction after measuring the assembled wheels. They are not powered wheels."
                }
              </T>
            </li>
          </ol>
          <h2>
            <T>{"Dimension drawing"}</T>
          </h2>
          <a href="/hardware/case/dimensions.svg">
            <Image
              src="/hardware/case/dimensions.svg"
              alt={t(
                "Top and side dimension drawing of the proposed robot case",
              )}
              width={1400}
              height={800}
              unoptimized
            />
          </a>
          <h2>
            <T>{"Download the editable concept"}</T>
          </h2>
          <p>
            <T>
              {
                "Use Python 3.9–3.12 with the pinned requirements. STL coordinates are millimeters and each part has its own flat-on-bed origin. The 3D viewer applies separate assembly offsets. Use the JSON parameters and Python generator to change the design and regenerate meshes; do not scale the finished STL as a substitute for checking component fit."
              }
            </T>
          </p>
          <div className="hardware-downloads">
            {["tray", "lid", "electronics-deck", "skid"].map((n) => (
              <a key={n} href={`/hardware/case/${n}.stl`} download>
                <T>{n.replaceAll("-", " ")}</T>
                <small>
                  <T>{"STL / millimeters"}</T>
                </small>
              </a>
            ))}
            <a href="/hardware/case/dimensions.json" download>
              <T>{"Dimensions"}</T>
              <small>
                <T>{"Editable JSON"}</T>
              </small>
            </a>
            <a href="/hardware/case/generate.py" download>
              <T>{"CAD generator"}</T>
              <small>
                <T>{"Python / Manifold3D"}</T>
              </small>
            </a>
            <a href="/hardware/case/requirements.txt" download>
              <T>{"Dependencies"}</T>
              <small>
                <T>{"Pinned versions"}</T>
              </small>
            </a>
            <a href="/hardware/case/mesh-report.json">
              <T>{"Mesh verification"}</T>
              <small>
                <T>{"Bounds, volume and closed edges"}</T>
              </small>
            </a>
          </div>
          <pre>
            <code>{`python3 -m venv .cad-venv\n.cad-venv/bin/pip install -r hardware/case/requirements.txt\n.cad-venv/bin/python hardware/case/generate.py`}</code>
          </pre>
          <h2>
            <T>{"Before a physical prototype"}</T>
          </h2>
          <p>
            <T>
              {
                "The battery is an unselected part envelope, not a measured pack. Confirm motor terminals, shaft/hub engagement, switch size, wire bends and PCB hole locations. Keep fasteners out of the battery bay. Preserve the ESP32 antenna keepout and use nonconductive material around it. Test dimensional coupons and choose wall thickness, tolerances, fasteners and material for the real printer and loads."
              }
            </T>
          </p>
          <p>
            <T>
              {
                "The geometry checks prove closed manifold surfaces and no intersection with the nominal battery keepout. They do not establish printability, temperature performance, mechanical strength or compliance of an assembled robot."
              }
            </T>
          </p>
        </section>
        <section
          id="guia-impressao"
          className="hardware-article case-print-guide"
          aria-label={t("Guia de impressão e montagem")}
        >
          <a href={`/hardware/case/${guideName}`} download>
            <T>{"Baixar o guia separado (Markdown)"}</T>
          </a>
          <MarkdownContent>{guide}</MarkdownContent>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
