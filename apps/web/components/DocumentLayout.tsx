"use client";
import { T, useI18n } from "../i18n/client";
import { LocalLink as Link } from "../i18n/client";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
export default function DocumentLayout({
  children,
  active = "/docs",
  label = "LEARNING LIBRARY",
}: {
  children: React.ReactNode;
  active?: string;
  label?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="public-site">
      <SiteHeader active={active} />
      <div className="document-layout">
        <aside className="document-sidebar">
          <span className="section-kicker">
            <T>{label}</T>
          </span>
          <nav aria-label={t("Documentation sections")}>
            <Link href="/docs">
              <T>{"Learning library"}</T>
            </Link>
            <Link href="/docs/first-match">
              <T>{"Your first match"}</T>
            </Link>
            <Link href="/docs/differential-drive">
              <T>{"Differential drive"}</T>
            </Link>
            <Link href="/docs/camera-and-markers">
              <T>{"Camera and markers"}</T>
            </Link>
            <Link href="/docs/referee-and-restarts">
              <T>{"Referee and restarts"}</T>
            </Link>
            <Link href="/rules">
              <T>{"Rules and scope"}</T>
            </Link>
            <Link href="/hardware">
              <T>{"Hardware reference"}</T>
            </Link>
            <Link href="/hardware/electronics">
              <T>{"Electronic diagram"}</T>
            </Link>
            <Link href="/hardware/case">
              <T>{"Case design"}</T>
            </Link>
            <Link href="/hardware/firmware">
              <T>{"Robot firmware"}</T>
            </Link>
            <Link href="/docs/protocol">
              <T>{"API and radio protocol"}</T>
            </Link>
            <Link href="/docs/remote-competition">
              <T>{"Remote competitions"}</T>
            </Link>
          </nav>
          <Link className="site-button solid" href="/lab">
            <T>{"Open laboratory"}</T>
          </Link>
        </aside>
        <main className="document-content">
          <T>{children}</T>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
