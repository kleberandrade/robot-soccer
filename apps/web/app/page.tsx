import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
export const metadata: Metadata = {
  title: "ROBOTSOCCER | Build. Understand. Compete.",
  description:
    "An open platform to learn robot soccer, develop autonomous teams and compete remotely in private VSSS simulation rooms.",
};
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
        <circle cx="335" cy="245" r="9" fill="#ef9058" />
        <path
          d="M180 240Q260 290 335 245"
          fill="none"
          stroke="#ef9058"
          strokeWidth="2"
          strokeDasharray="5 7"
        />
      </g>
      <text x="90" y="585" fill="#829f9f" fontSize="12" fontFamily="monospace">
        VSSS · THREE ROBOTS PER TEAM · ONE SHARED WORLD
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
            <span className="section-kicker">OPEN ROBOTICS LABORATORY</span>
            <h1>
              Small robots.
              <br />
              <em>Real ideas.</em>
            </h1>
            <p>
              Turn a few lines of code into a team on the field. Learn the
              mechanics, develop your strategy, and put it to the test with
              someone anywhere.
            </p>
            <div className="hero-actions">
              <Link className="site-button solid" href="/lab">
                Open laboratory
              </Link>
              <Link className="site-button outline" href="/docs/first-match">
                Start learning
              </Link>
            </div>
            <div className="hero-footnote">
              <span className="status-dot" />
              Open source · VSSS 3 × 3 · Browser-based simulation
            </div>
          </div>
          <div className="hero-field">
            <div className="hero-field-caption">
              <span>THE PLAYING FIELD</span>
              <span>01 / SIMULATION</span>
            </div>
            <FieldPreview />
            <div className="field-spec-strip">
              <span>
                <strong>1.50 × 1.30</strong>meters
              </span>
              <span>
                <strong>60 Hz</strong>fixed simulation step
              </span>
              <span>
                <strong>Two views</strong>3D scene + camera
              </span>
            </div>
          </div>
        </section>
        <section className="project-principles">
          <p className="section-kicker">FROM FIRST PRINCIPLES TO MATCH DAY</p>
          <div>
            <h2>
              A whole robotics workflow.
              <br />
              One place to explore it.
            </h2>
            <p>
              Robot soccer brings motion, perception, control and teamwork
              together. This project makes each part visible, editable and
              connected.
            </p>
          </div>
        </section>
        <section className="project-paths">
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
              <span>{c.n}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <Link href={c.href}>{c.label}</Link>
            </article>
          ))}
        </section>
        <section className="project-feature">
          <div className="feature-text">
            <span className="section-kicker">A LAB YOU CAN INSPECT</span>
            <h2>
              See the same match
              <br />
              from both sides of the lens.
            </h2>
            <p>
              Explore the physical scene in 3D while the overhead projection
              shows what a virtual camera sees. Wheel rotation follows traveled
              distance, and both views share the same simulation frame.
            </p>
            <Link className="site-button outline" href="/lab">
              Explore the simulator
            </Link>
          </div>
          <div className="feature-notes">
            <article>
              <span>CONTROL</span>
              <h3>Two wheels. Continuous motion.</h3>
              <p>
                Configurable dimensions, axle track, wheel radius and
                acceleration.
              </p>
            </article>
            <article>
              <span>PERCEPTION</span>
              <h3>A camera with a point of view.</h3>
              <p>
                Adjust height, tilt and field of view. Compare roof markers at
                their real scale.
              </p>
            </article>
            <article>
              <span>RULES</span>
              <h3>A match with a referee.</h3>
              <p>
                Inspect fouls and restarts under the selected organizer-linked
                VSSS reference.
              </p>
            </article>
          </div>
        </section>
        <section className="project-resources">
          <div>
            <span className="section-kicker">TAKE THE NEXT STEP</span>
            <h2>Everything behind the game.</h2>
          </div>
          <nav>
            <Link href="/docs">
              Learning library{" "}
              <small>Guides, code and repeatable experiments</small>
            </Link>
            <Link href="/rules">
              Rules and scope{" "}
              <small>The selected reference and model limitations</small>
            </Link>
            <Link href="/hardware">
              Hardware reference{" "}
              <small>Dimensions, wiring, components and firmware</small>
            </Link>
          </nav>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
