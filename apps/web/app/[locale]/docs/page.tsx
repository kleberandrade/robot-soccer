import { getTranslator } from "../../../i18n/server";

import { T } from "../../../i18n/client";
import { LocalLink as Link } from "../../../i18n/client";
import type { Metadata } from "next";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { articles } from "./library";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: t("Learning library | ROBOTSOCCER"),
    description: t(
      "Didactic articles, code examples, setup, rules, hardware and remote competition guides.",
    ),
  };
}
export default function Library() {
  return (
    <div className="public-site">
      <SiteHeader active="/docs" />
      <main className="learning-library">
        <header>
          <span className="section-kicker">
            <T>{"THE LEARNING LIBRARY"}</T>
          </span>
          <h1>
            <T>{"Understand every"}</T>
            <br />
            <T>{"part of the game."}</T>
          </h1>
          <p>
            <T>
              {
                "Start with a match. Follow the mechanics. Then build something of your own."
              }
            </T>
          </p>
        </header>
        <section>
          <div className="library-section-label">
            <span>01</span>
            <h2>
              <T>{"Learn by experimenting"}</T>
            </h2>
          </div>
          <div className="learning-cards">
            {articles.slice(0, 4).map((a, i) => (
              <Link key={a.slug} href={"/docs/" + a.slug}>
                <span className="lesson-number">
                  <T>{"LESSON"}</T>
                  <T>{String(i + 1).padStart(2, "0")}</T>
                </span>
                <h3>
                  <T>{a.title.replace(/^\d+\. /, "")}</T>
                </h3>
                <p>
                  <T>{a.summary}</T>
                </p>
                <span className="reading-label">
                  <T>{"Read the article"}</T>
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <div className="library-section-label">
            <span>02</span>
            <h2>
              <T>{"Project reference"}</T>
            </h2>
          </div>
          <div className="reference-links">
            {articles.slice(4).map((a) => (
              <Link key={a.slug} href={"/docs/" + a.slug}>
                <h3>
                  <T>{a.title}</T>
                </h3>
                <p>
                  <T>{a.summary}</T>
                </p>
              </Link>
            ))}
            <Link href="/rules">
              <h3>
                <T>{"VSSS rules and scope"}</T>
              </h3>
              <p>
                <T>
                  {
                    "Source provenance, reference dimensions and modeled referee behavior."
                  }
                </T>
              </p>
            </Link>
            <Link href="/hardware">
              <h3>
                <T>{"Hardware reference"}</T>
              </h3>
              <p>
                <T>
                  {
                    "Robot dimensions, wiring diagram, component list, pin map and firmware."
                  }
                </T>
              </p>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
