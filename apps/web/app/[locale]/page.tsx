import Reveal from "../../components/Reveal";
import Image from "next/image";
import { getTranslator } from "../../i18n/server";

import { T } from "../../i18n/client";
import { LocalLink as Link } from "../../i18n/client";
import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: t("ROBOTSOCCER | Build. Understand. Compete."),
    description: t(
      "An open platform to learn robot soccer, develop autonomous teams and compete remotely in private VSSS simulation rooms.",
    ),
  };
}
function FieldPreview() {
  return (
    <svg
      viewBox="0 0 760 600"
      role="img"
      aria-label="A miniature robot soccer field with two autonomous teams"
    >
      <defs>
        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path
            d="M32 0H0V32"
            fill="none"
            stroke="#ffffff"
            strokeOpacity=".035"
          />
        </pattern>
        <linearGradient id="field" x2="0" y2="1">
          <stop stopColor="#1d3239" />
          <stop offset="1" stopColor="#101e25" />
        </linearGradient>
      </defs>
      <rect width="760" height="600" fill="url(#grid)" />
      <g transform="translate(86 64)">
        <path
          d="M28 20H560L588 48V452L560 480H28L0 452V48Z"
          fill="url(#field)"
          stroke="#607f80"
          strokeWidth="2"
        />
        <path
          d="M294 20V480 M0 132H78V368H0 M588 132H510V368H588"
          fill="none"
          stroke="#b1c8bc"
          strokeOpacity=".6"
        />
        <circle
          cx="294"
          cy="250"
          r="78"
          fill="none"
          stroke="#b1c8bc"
          strokeOpacity=".6"
        />
        {[
          [155, 225, 20, "#327ab1"],
          [95, 100, -12, "#327ab1"],
          [34, 290, 0, "#327ab1"],
          [426, 300, 155, "#e6bf50"],
          [470, 140, 192, "#e6bf50"],
          [550, 260, 180, "#e6bf50"],
        ].map(([x, y, r, color], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
            <rect
              x="-18"
              y="-18"
              width="36"
              height="36"
              rx="3"
              fill="#080e13"
              stroke="#6d8a8b"
            />
            <rect x="2" y="-14" width="12" height="28" fill={color as string} />
            <rect
              x="-14"
              y="-14"
              width="12"
              height="12"
              fill={i % 2 ? "#46bd80" : "#e65f60"}
            />
            <rect
              x="-14"
              y="2"
              width="12"
              height="12"
              fill={i % 2 ? "#55bbce" : "#46bd80"}
            />
            <path d="M-8 -21H8 M-8 21H8" stroke="#859a9d" strokeWidth="4" />
          </g>
        ))}
        <circle className="hero-ball" cx="335" cy="245" r="9" fill="#ef9058" />
        <path
          className="hero-trajectory"
          d="M180 240Q260 290 335 245"
          fill="none"
          stroke="#ef9058"
          strokeWidth="2"
          strokeDasharray="5 7"
        />
      </g>
      <text x="90" y="585" fill="#829f9f" fontSize="12" fontFamily="monospace">
        <T>{"VSSS · THREE ROBOTS PER TEAM · ONE SHARED WORLD"}</T>
      </text>
    </svg>
  );
}
export default function Home() {
  return (
    <div className="public-site">
      <SiteHeader active="/" />
      <main>
        <section className="project-hero">
          <div className="hero-story">
            <span className="section-kicker">
              <T>{"OPEN ROBOTICS LABORATORY"}</T>
            </span>
            <h1>
              <T>{"Small robots."}</T>
              <br />
              <em>
                <T>{"Real ideas."}</T>
              </em>
            </h1>
            <p>
              <T>
                {
                  "Turn a few lines of code into a team on the field. Learn the mechanics, develop your strategy, and put it to the test with someone anywhere."
                }
              </T>
            </p>
            <div className="hero-actions">
              <Link className="site-button solid" href="/lab">
                <T>{"Open laboratory"}</T>
              </Link>
              <Link className="site-button outline" href="/docs/first-match">
                <T>{"Start learning"}</T>
              </Link>
            </div>
            <div className="hero-footnote">
              <span className="status-dot" />
              <T>{"Open source · VSSS 3 × 3 · Browser-based simulation"}</T>
            </div>
          </div>
          <div className="hero-field">
            <div className="hero-field-caption">
              <span>
                <T>{"THE PLAYING FIELD"}</T>
              </span>
              <span>
                <T>{"01 / SIMULATION"}</T>
              </span>
            </div>
            <FieldPreview />
            <div className="field-spec-strip">
              <span>
                <strong>1.50 × 1.30</strong>
                <T>{"meters"}</T>
              </span>
              <span>
                <strong>
                  <T>{"60 Hz"}</T>
                </strong>
                <T>{"fixed simulation step"}</T>
              </span>
              <span>
                <strong>
                  <T>{"Two views"}</T>
                </strong>
                <T>{"3D scene + camera"}</T>
              </span>
            </div>
          </div>
        </section>
        <Reveal className="project-principles">
          <p className="section-kicker">
            <T>{"FROM FIRST PRINCIPLES TO MATCH DAY"}</T>
          </p>
          <div>
            <h2>
              <T>{"A whole robotics workflow."}</T>
              <br />
              <T>{"One place to explore it."}</T>
            </h2>
            <p>
              <T>
                {
                  "Robot soccer brings motion, perception, control and teamwork together. This project makes each part visible, editable and connected."
                }
              </T>
            </p>
          </div>
        </Reveal>
        <Reveal className="project-paths">
          {[
            {
              n: "01",
              title: "Understand the robot",
              text: "Follow wheel speeds into movement. Inspect dimensions, colored markers and the overhead camera.",
              href: "/docs/differential-drive",
              label: "Explore the fundamentals",
            },
            {
              n: "02",
              title: "Build your team",
              text: "Read Koativa and Circuit, run a match, then change one decision and compare the result.",
              href: "/docs/first-match",
              label: "Meet the example teams",
            },
            {
              n: "03",
              title: "Play together",
              text: "Create a private room. Connect each team from its own computer while the server keeps the official match state.",
              href: "/compete",
              label: "Private competitions",
            },
          ].map((c) => (
            <article key={c.n}>
              <span>
                <T>{c.n}</T>
              </span>
              <h3>
                <T>{c.title}</T>
              </h3>
              <p>
                <T>{c.text}</T>
              </p>
              <Link href={c.href}>
                <T>{c.label}</T>
              </Link>
            </article>
          ))}
        </Reveal>
        <Reveal className="project-feature">
          <div className="feature-text">
            <span className="section-kicker">
              <T>{"A LAB YOU CAN INSPECT"}</T>
            </span>
            <h2>
              <T>{"See the same match"}</T>
              <br />
              <T>{"from both sides of the lens."}</T>
            </h2>
            <p>
              <T>
                {
                  "Explore the physical scene in 3D while the overhead projection shows what a virtual camera sees. Wheel rotation follows traveled distance, and both views share the same simulation frame."
                }
              </T>
            </p>
            <Link className="site-button outline" href="/lab">
              <T>{"Explore the simulator"}</T>
            </Link>
          </div>
          <div className="feature-showcase">
            <div className="showcase-top">
              <span className="status-dot" />
              <T>One state. Two views.</T>
              <span>60 Hz / VSSS</span>
            </div>
            <Image
              src="/learning/laboratory.jpg"
              alt="Laboratory with synchronized 3D and camera views"
              width={1905}
              height={866}
            />
            <div className="feature-notes">
              <article>
                <span>
                  <T>{"CONTROL"}</T>
                </span>
                <h3>
                  <T>{"Two wheels. Continuous motion."}</T>
                </h3>
                <p>
                  <T>
                    {
                      "Configurable dimensions, axle track, wheel radius and acceleration."
                    }
                  </T>
                </p>
              </article>
              <article>
                <span>
                  <T>{"PERCEPTION"}</T>
                </span>
                <h3>
                  <T>{"A camera with a point of view."}</T>
                </h3>
                <p>
                  <T>
                    {
                      "Adjust height, tilt and field of view. Compare roof markers at their real scale."
                    }
                  </T>
                </p>
              </article>
              <article>
                <span>
                  <T>{"RULES"}</T>
                </span>
                <h3>
                  <T>{"A match with a referee."}</T>
                </h3>
                <p>
                  <T>
                    {
                      "Inspect fouls and restarts under the selected organizer-linked VSSS reference."
                    }
                  </T>
                </p>
              </article>
            </div>
          </div>
        </Reveal>
        <Reveal className="project-resources">
          <div>
            <span className="section-kicker">
              <T>{"TAKE THE NEXT STEP"}</T>
            </span>
            <h2>
              <T>{"Everything behind the game."}</T>
            </h2>
          </div>
          <nav>
            <Link href="/docs">
              <T>{"Learning library"}</T>
              <T> </T>
              <small>
                <T>{"Guides, code and repeatable experiments"}</T>
              </small>
            </Link>
            <Link href="/rules">
              <T>{"Rules and scope"}</T>
              <T> </T>
              <small>
                <T>{"The selected reference and model limitations"}</T>
              </small>
            </Link>
            <Link href="/hardware">
              <T>{"Hardware reference"}</T>
              <T> </T>
              <small>
                <T>{"Dimensions, wiring, components and firmware"}</T>
              </small>
            </Link>
          </nav>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
