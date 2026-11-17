import Link from "next/link";
export default function SiteHeader({ active }: { active?: string }) {
  const links = [
    ["Project", "/"],
    ["Laboratory", "/lab"],
    ["Compete", "/compete"],
    ["Learn", "/docs"],
    ["Rules", "/rules"],
    ["Hardware", "/hardware"],
  ];
  return (
    <header className="site-header">
      <Link href="/" className="site-brand">
        <span className="site-monogram">RS</span>
        <span>
          ROBOT<span className="brand-light">SOCCER</span>
        </span>
      </Link>
      <nav aria-label="Main navigation">
        {links.map(([label, url]) => (
          <Link
            key={url}
            href={url}
            aria-current={active === url ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <a
        className="source-link"
        href="https://github.com/kleberandrade/robot-soccer"
      >
        Source code
      </a>
    </header>
  );
}
