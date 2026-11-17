import Link from "next/link";
import type { Metadata } from "next";
import { articles } from "./library";
export const metadata: Metadata = {
  title: "Learning library | ROBOT-SOCCER",
  description:
    "Step-by-step articles and runnable examples for VSSS simulation, autonomous teams, differential drive, and camera geometry.",
};
export default function Docs() {
  return (
    <main className="docs-shell">
      <header className="docs-nav">
        <Link href="/">← Match lab</Link>
        <span>ROBOT-SOCCER / LEARNING LIBRARY</span>
      </header>
      <p className="eyebrow">LEARN BY RUNNING A MATCH</p>
      <h1>
        From two wheels
        <br />
        to a whole team.
      </h1>
      <p className="docs-lead">
        Start with the first match, then explore one concept at a time. Each
        article includes working commands, an explanation, and an experiment you
        can repeat.
      </p>
      <div className="article-grid">
        {articles.map((a) => (
          <Link key={a.slug} href={`/docs/${a.slug}`} className="article-card">
            <h2>{a.title}</h2>
            <p>{a.summary}</p>
            <span>Read article →</span>
          </Link>
        ))}
      </div>
      <section className="docs-note">
        <h2>Know the reference</h2>
        <p>
          The selected reference is the VSSS Série A PDF linked by the official
          LARC 2026 site. Its filename says 2025 and its cover says 2023. The
          simulator names that source explicitly; it does not claim
          certification or undisclosed 2026 amendments.
        </p>
        <a
          href="https://mecatronica.umng.edu.co/index.html/larc.html"
          target="_blank"
          rel="noreferrer"
        >
          Official organizer and rulebook ↗
        </a>
        <p>
          For electronics, licensing, setup and the full verification log, visit
          the{" "}
          <a href="https://github.com/kleberandrade/robot-soccer#readme">
            project repository ↗
          </a>
          .
        </p>
      </section>
    </main>
  );
}
