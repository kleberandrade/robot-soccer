"use client";
import SiteLogo from "./SiteLogo";
import { T, useI18n } from "../i18n/client";
import { Suspense } from "react";
import { LocalLink as Link, LanguageSwitcher } from "../i18n/client";
export default function SiteHeader({ active }: { active?: string }) {
  const { t } = useI18n();
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
        <SiteLogo />
      </Link>
      <nav aria-label={t("Main navigation")}>
        {links.map(([label, url]) => (
          <Link
            key={url}
            href={url}
            aria-current={active === url ? "page" : undefined}
          >
            <T>{label}</T>
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <Suspense>
          <LanguageSwitcher />
        </Suspense>
      </div>
    </header>
  );
}
