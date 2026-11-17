import { T, LocalLink as Link } from "../i18n/client";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
export default function NotFound() {
  return (
    <div className="public-site">
      <SiteHeader />
      <main className="not-found-page">
        <span className="section-kicker">404 / ROBOTSOCCER</span>
        <h1>
          <T>This page is off the field.</T>
        </h1>
        <p>
          <T>
            The address may have changed. Return to the project or open the
            laboratory.
          </T>
        </p>
        <Link href="/" className="site-button solid">
          <T>Project</T>
        </Link>
        <Link href="/lab" className="site-button outline">
          <T>Open laboratory</T>
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
