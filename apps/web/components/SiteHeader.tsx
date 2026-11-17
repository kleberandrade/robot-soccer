"use client";
import SiteLogo from "./SiteLogo";
import { Suspense, useEffect, useRef } from "react";
import {
  T,
  useI18n,
  LocalLink as Link,
  LanguageSwitcher,
} from "../i18n/client";
const primary = [
  ["Project", "/"],
  ["Laboratory", "/lab"],
  ["Compete", "/compete"],
];
const resources = [
  ["Learn", "/docs"],
  ["Rules", "/rules"],
  ["Hardware", "/hardware"],
];
function NavigationMenu({ active }: { active?: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        ref.current.open = false;
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return (
    <details
      className="nav-disclosure"
      ref={ref}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.currentTarget.open = false;
          event.currentTarget.querySelector("summary")?.focus();
        }
      }}
    >
      <summary
        className={
          resources.some(([, href]) => href === active) ? "resource-active" : ""
        }
      >
        <span className="nav-resources-label">
          <T>Resources</T>
        </span>
        <span className="nav-all-label">
          <T>Explore</T>
        </span>
      </summary>
      <div
        className="nav-dropdown"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a") && ref.current)
            ref.current.open = false;
        }}
      >
        <div className="nav-mobile-primary">
          {primary.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={active === href ? "page" : undefined}
            >
              <T>{label}</T>
            </Link>
          ))}
        </div>
        {resources.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            aria-current={active === href ? "page" : undefined}
          >
            <T>{label}</T>
          </Link>
        ))}
      </div>
    </details>
  );
}
export default function SiteHeader({ active }: { active?: string }) {
  const { t } = useI18n();
  return (
    <header className="site-header site-container">
      <Link href="/" className="site-brand">
        <SiteLogo />
      </Link>
      <nav aria-label={t("Main navigation")}>
        <div className="nav-primary-links">
          {primary.map(([label, href]) => (
            <Link
              key={href}
              className={href === "/" ? "primary-home" : undefined}
              href={href}
              aria-current={active === href ? "page" : undefined}
            >
              <T>{label}</T>
            </Link>
          ))}
        </div>
        <NavigationMenu active={active} />
      </nav>
      <div className="header-actions">
        <Suspense>
          <LanguageSwitcher />
        </Suspense>
      </div>
    </header>
  );
}
