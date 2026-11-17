import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { articles } from "./library";
export const metadata: Metadata = {
  title: "Learning library | ROBOTSOCCER",
  description:
    "Didactic articles, code examples, setup, rules, hardware and remote competition guides.",
};
export default function Library() {
  return (
    <div className="public-site">
      <SiteHeader active="/docs" />
      <main className="learning-library">
        <header>
          <span className="section-kicker">THE LEARNING LIBRARY</span>
          <h1>
            Understand every
            <br />
            part of the game.
          </h1>
          <p>
            Start with a match. Follow the mechanics. Then build something of
            your own.
          </p>
        </header>
        <section>
          <div className="library-section-label">
            <span>01</span>
            <h2>Learn by experimenting</h2>
          </div>
          <div className="learning-cards">
            {articles.slice(0, 4).map((a, i) => (
              <Link key={a.slug} href={"/docs/" + a.slug}>
                <span className="lesson-number">
                  LESSON {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{a.title.replace(/^\d+\. /, "")}</h3>
                <p>{a.summary}</p>
                <span className="reading-label">Read the article</span>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <div className="library-section-label">
            <span>02</span>
            <h2>Project reference</h2>
          </div>
          <div className="reference-links">
            {articles.slice(4).map((a) => (
              <Link key={a.slug} href={"/docs/" + a.slug}>
                <h3>{a.title}</h3>
                <p>{a.summary}</p>
              </Link>
            ))}
            <Link href="/rules">
              <h3>VSSS rules and scope</h3>
              <p>
                Source provenance, reference dimensions and modeled referee
                behavior.
              </p>
            </Link>
            <Link href="/hardware">
              <h3>Hardware reference</h3>
              <p>
                Robot dimensions, wiring diagram, component list, pin map and
                firmware.
              </p>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
