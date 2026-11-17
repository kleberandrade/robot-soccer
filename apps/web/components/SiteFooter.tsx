import Link from "next/link";
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>ROBOTSOCCER</strong>
        <p>An open laboratory for autonomous robot football.</p>
        <small>
          Origin: Fatec Americana · Kléber de Oliveira Andrade · MIT
        </small>
      </div>
      <nav aria-label="Footer">
        <Link href="/lab">Laboratory</Link>
        <Link href="/docs">Documentation</Link>
        <Link href="/rules">Rules reference</Link>
        <Link href="/hardware">Hardware</Link>
      </nav>
      <span>
        Built to understand.
        <br />
        Designed to experiment.
      </span>
    </footer>
  );
}
