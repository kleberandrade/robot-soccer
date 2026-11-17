"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import NextLink from "next/link";
import LanguageFlag from "./LanguageFlag";
import { usePathname, useSearchParams } from "next/navigation";
import { localizedPath, stripLocale, locales, type Locale } from "./config";
import { translate, formatText } from "./catalog";
const LocaleContext = createContext<{
  locale: Locale;
  changeLocale: (locale: Locale) => void;
}>({ locale: "pt-BR", changeLocale: () => {} });
export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [active, setActive] = useState(locale);
  useEffect(() => setActive(locale), [locale]);
  useEffect(() => {
    document.documentElement.lang = active;
  }, [active]);
  return (
    <LocaleContext.Provider value={{ locale: active, changeLocale: setActive }}>
      {children}
    </LocaleContext.Provider>
  );
}
export function useI18n() {
  const context = useContext(LocaleContext);
  return { ...context, t: (text: string) => translate(context.locale, text) };
}
export function T({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  if (typeof children === "number") return formatText(locale, children);
  if (typeof children !== "string") return children;
  if (!children.trim()) return children;
  const text = formatText(locale, children.trim());
  // Text fragments retain separation around inline links, code and translated labels.
  return `${children.trim().startsWith("·") ? " " : ""}${text} `;
}
export function LocalLink(props: React.ComponentProps<typeof NextLink>) {
  const { locale } = useI18n();
  return (
    <NextLink
      {...props}
      href={
        typeof props.href === "string"
          ? localizedPath(props.href, locale)
          : props.href
      }
    />
  );
}
export function LanguageSwitcher() {
  const { locale, t, changeLocale } = useI18n();
  const pathname = usePathname();
  const search = useSearchParams();
  function choose(next: Locale) {
    const destination =
      localizedPath(pathname, next) +
      (search.size ? `?${search}` : "") +
      window.location.hash;
    // Interactive labs keep their in-memory match/room credentials during a language change.
    if (["/lab", "/compete"].includes(stripLocale(pathname))) {
      changeLocale(next);
      document.cookie = `rs-locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      document.documentElement.lang = next;
      document.title = translate(
        next,
        stripLocale(pathname) === "/lab"
          ? "Laboratory | ROBOTSOCCER"
          : "Private competitions | ROBOTSOCCER",
      );
      window.history.replaceState(null, "", destination);
    } else window.location.assign(destination);
  }
  return (
    <label className="language-switcher">
      <span className="sr-only">{t("Language")}</span>
      <LanguageFlag locale={locale} />
      <select
        aria-label={t("Language")}
        value={locale}
        onChange={(e) => choose(e.target.value as Locale)}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {
              { "pt-BR": "Português (Brasil)", en: "English", es: "Español" }[
                code
              ]
            }
          </option>
        ))}
      </select>
    </label>
  );
}
