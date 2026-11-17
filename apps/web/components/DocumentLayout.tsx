import Link from "next/link";
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
  return (
    <div className="public-site">
      <SiteHeader active={active} />
      <div className="document-layout">
        <aside className="document-sidebar">
          <span className="section-kicker">{label}</span>
          <nav aria-label="Documentation sections">
            <Link href="/docs">Learning library</Link>
            <Link href="/docs/first-match">Your first match</Link>
            <Link href="/docs/differential-drive">Differential drive</Link>
            <Link href="/docs/camera-and-markers">Camera and markers</Link>
            <Link href="/docs/referee-and-restarts">Referee and restarts</Link>
            <Link href="/rules">Rules and scope</Link>
            <Link href="/hardware">Hardware reference</Link>
            <Link href="/hardware/electronics">Electronic diagram</Link>
            <Link href="/hardware/case">Case design</Link>
            <Link href="/hardware/firmware">Robot firmware</Link>
            <Link href="/docs/protocol">API and radio protocol</Link>
            <Link href="/docs/remote-competition">Remote competitions</Link>
          </nav>
          <Link className="site-button solid" href="/lab">
            Open laboratory
          </Link>
        </aside>
        <main className="document-content">{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
