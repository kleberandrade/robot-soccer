import { readFile } from "node:fs/promises";
import path from "node:path";
import MarkdownContent from "../../../components/MarkdownContent";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import CaseExplorer from "../../../components/CaseExplorer";
export const metadata: Metadata = {
  title: "Robot case design | ROBOTSOCCER",
  description:
    "Inspect a parametric 70 mm robot case in 3D, explore its assembly and download closed-manifold STL concept files.",
};
export default async function CasePage() {
  const guide = await readFile(
    path.resolve(
      process.cwd(),
      "public/hardware/case/GUIA-IMPRESSAO-E-MONTAGEM.md",
    ),
    "utf8",
  );
  return (
    <div className="public-site">
      <SiteHeader active="/hardware" />
      <main className="hardware-wide">
        <Link className="breadcrumb" href="/hardware">
          Hardware reference / Case design
        </Link>
        <header className="hardware-page-title">
          <span className="section-kicker">
            MECHANICAL DESIGN / CONCEPT REV A
          </span>
          <h1>
            A compact home
            <br />
            for the whole robot.
          </h1>
          <p>
            Inspect the actual generated STL parts, separate the lid and
            electronics deck, and check the dimension budget before building.
          </p>
        </header>
        <div className="document-banner">
          <span>UNBUILT DESIGN</span>
          <p>
            The meshes are geometrically checked. Fit, printing, loads, center
            of mass and physical competition inspection remain unverified.
          </p>
        </div>
        <section className="case-bundle" aria-label="Pacote completo do case">
          <div>
            <h2>Todas as peças, um único download.</h2>
            <p>
              Quatro STL em milímetros, guia didático em português, desenho
              cotado e fonte CAD editável. Protótipo Rev A, ainda sem impressão
              ou montagem física validadas.
            </p>
          </div>
          <div>
            <a
              className="site-button"
              href="/hardware/case/robot-soccer-case-rev-a.zip"
              download
            >
              Baixar todos os STL + guia (ZIP)
            </a>
            <a className="case-guide-link" href="#guia-impressao">
              Ler o guia de impressão e montagem
            </a>
          </div>
        </section>
        <CaseExplorer />
        <div className="case-specs">
          <article>
            <span>CASE</span>
            <strong>70 × 70 mm</strong>
            <p>
              Shell footprint. A 2 mm lid closes the assembly at 65 mm height
              above the ground plane.
            </p>
          </article>
          <article>
            <span>DRIVE</span>
            <strong>72 mm tire span</strong>
            <p>
              65 mm wheel track + 7 mm wheel width. Measure actual hubs and
              shaft ends against the 75 mm bare envelope.
            </p>
          </article>
          <article>
            <span>PACKAGING</span>
            <strong>25 × 45 × 18 mm</strong>
            <p>
              Maximum battery keepout, behind the motors. A removable deck holds
              a proposed 45 × 40 mm carrier above it.
            </p>
          </article>
        </div>
        <section className="hardware-article">
          <h2>Built as a serviceable stack</h2>
          <ol>
            <li>
              <strong>Lower tray.</strong> A 2 mm floor, 1.6 mm side walls, open
              wheel windows, nominal N20 locating rails and strap slots. Four
              corner columns support the removable deck and lid.
            </li>
            <li>
              <strong>Electronics deck.</strong> The 65.8 mm plate drops over
              the corner columns and rests at 30 mm. It has cable slots and four
              provisional PCB standoffs on a 39 × 34 mm hole pattern.
            </li>
            <li>
              <strong>Marker lid.</strong> A flat top supports the 65 mm tag
              layout. Recessed fastener positions avoid deliberately projecting
              screw heads above the marker plane. Adapt them to the selected
              screws.
            </li>
            <li>
              <strong>Passive skids.</strong> Optional separate support pads;
              adjust their contact height and friction after measuring the
              assembled wheels. They are not powered wheels.
            </li>
          </ol>
          <h2>Dimension drawing</h2>
          <a href="/hardware/case/dimensions.svg">
            <Image
              src="/hardware/case/dimensions.svg"
              alt="Top and side dimension drawing of the proposed robot case"
              width={1400}
              height={800}
              unoptimized
            />
          </a>
          <h2>Download the editable concept</h2>
          <p>
            Use Python 3.9–3.12 with the pinned requirements. STL coordinates
            are millimeters and each part has its own flat-on-bed origin. The 3D
            viewer applies separate assembly offsets. Use the JSON parameters
            and Python generator to change the design and regenerate meshes; do
            not scale the finished STL as a substitute for checking component
            fit.
          </p>
          <div className="hardware-downloads">
            {["tray", "lid", "electronics-deck", "skid"].map((n) => (
              <a key={n} href={`/hardware/case/${n}.stl`} download>
                {n.replaceAll("-", " ")}
                <small>STL / millimeters</small>
              </a>
            ))}
            <a href="/hardware/case/dimensions.json" download>
              Dimensions<small>Editable JSON</small>
            </a>
            <a href="/hardware/case/generate.py" download>
              CAD generator<small>Python / Manifold3D</small>
            </a>
            <a href="/hardware/case/requirements.txt" download>
              Dependencies<small>Pinned versions</small>
            </a>
            <a href="/hardware/case/mesh-report.json">
              Mesh verification<small>Bounds, volume and closed edges</small>
            </a>
          </div>
          <pre>
            <code>{`python3 -m venv .cad-venv\n.cad-venv/bin/pip install -r hardware/case/requirements.txt\n.cad-venv/bin/python hardware/case/generate.py`}</code>
          </pre>
          <h2>Before a physical prototype</h2>
          <p>
            The battery is an unselected part envelope, not a measured pack.
            Confirm motor terminals, shaft/hub engagement, switch size, wire
            bends and PCB hole locations. Keep fasteners out of the battery bay.
            Preserve the ESP32 antenna keepout and use nonconductive material
            around it. Test dimensional coupons and choose wall thickness,
            tolerances, fasteners and material for the real printer and loads.
          </p>
          <p>
            The geometry checks prove closed manifold surfaces and no
            intersection with the nominal battery keepout. They do not establish
            printability, temperature performance, mechanical strength or
            compliance of an assembled robot.
          </p>
        </section>
        <section
          id="guia-impressao"
          className="hardware-article case-print-guide"
          aria-label="Guia de impressão e montagem"
        >
          <a href="/hardware/case/GUIA-IMPRESSAO-E-MONTAGEM.md" download>
            Baixar o guia separado (Markdown)
          </a>
          <MarkdownContent>{guide}</MarkdownContent>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
