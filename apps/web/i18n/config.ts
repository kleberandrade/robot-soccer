export const locales = ["pt-BR", "en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt-BR";
export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}
export function stripLocale(path: string) {
  return path.replace(/^\/(pt-BR|en|es)(?=[/?#]|$)/, "") || "/";
}
export function localizedPath(path: string, locale: Locale) {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    /^\/(api|_next)(\/|$)/.test(path) ||
    /\.[a-z0-9]+(?:[?#]|$)/i.test(path)
  )
    return path;
  const plain = stripLocale(path);
  return `/${locale}${plain === "/" ? "" : plain}`;
}
