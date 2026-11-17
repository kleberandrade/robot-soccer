import { headers } from "next/headers";
import { defaultLocale, isLocale } from "./config";
import { translate } from "./catalog";
export async function getLocale() {
  const value = (await headers()).get("x-rs-locale");
  return isLocale(value) ? value : defaultLocale;
}
export async function getTranslator() {
  const locale = await getLocale();
  return (text: string) => translate(locale, text);
}

export async function pageAlternates() {
  const locale = await getLocale();
  const pathname = (await headers()).get("x-rs-path") ?? "/";
  const { localizedPath, locales } = await import("./config");
  return {
    canonical: localizedPath(pathname, locale),
    languages: Object.fromEntries(
      locales.map((code) => [code, localizedPath(pathname, code)]),
    ),
  };
}
