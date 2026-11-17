"use client";
import { T, useI18n, LocalLink as Link } from "../i18n/client";
import SiteLogo from "./SiteLogo";
export default function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="site-footer" aria-label={t("Footer")}>
      <div className="footer-invitation">
        <div>
          <span className="section-kicker">
            <T>YOUR NEXT EXPERIMENT</T>
          </span>
          <h2>
            <T>Good ideas deserve a playing field.</T>
          </h2>
        </div>
        <Link className="site-button solid" href="/lab">
          <T>Open laboratory</T>
        </Link>
      </div>
      <div className="footer-main">
        <div className="footer-about">
          <Link href="/" className="site-brand">
            <SiteLogo />
          </Link>
          <p>
            <T>An open laboratory for autonomous robot football.</T>
          </p>
          <a
            className="footer-github"
            href="https://github.com/kleberandrade/robot-soccer"
            target="_blank"
            rel="noreferrer"
          >
            <span aria-hidden="true">&lt;/&gt;</span>
            <T>Source code on GitHub</T>
          </a>
        </div>
        <nav aria-label={t("Explore")}>
          <h3>
            <T>Explore</T>
          </h3>
          <Link href="/lab">
            <T>Laboratory</T>
          </Link>
          <Link href="/compete">
            <T>Private competitions</T>
          </Link>
          <Link href="/docs">
            <T>Learning library</T>
          </Link>
        </nav>
        <nav aria-label={t("Build")}>
          <h3>
            <T>Build</T>
          </h3>
          <Link href="/hardware/electronics">
            <T>Electronic diagram</T>
          </Link>
          <Link href="/hardware/case">
            <T>Case design</T>
          </Link>
          <Link href="/hardware/firmware">
            <T>Robot firmware</T>
          </Link>
          <Link href="/rules">
            <T>Rules and scope</T>
          </Link>
        </nav>
        <nav aria-label={t("Community")}>
          <h3>
            <T>Community</T>
          </h3>
          <Link href="/contributing">
            <T>Contribute</T>
          </Link>
          <a href="https://github.com/kleberandrade/robot-soccer/issues">
            <T>Report an issue</T>
          </a>
          <a href="https://github.com/kleberandrade/robot-soccer/blob/master/LICENSE">
            <T>MIT license</T>
          </a>
        </nav>
      </div>
      <div className="footer-bottom">
        <small>
          <T>Origin: Fatec Americana · Kléber de Oliveira Andrade · MIT</T>
        </small>
        <nav aria-label={t("Legal")}>
          <Link href="/privacy">
            <T>Privacy policy</T>
          </Link>
          <Link href="/terms">
            <T>Terms of use</T>
          </Link>
          <Link href="/contributing">
            <T>Contribute</T>
          </Link>
        </nav>
        <span className="footer-signoff">
          <i />
          <T>Built to experiment.</T>
        </span>
      </div>
    </footer>
  );
}
