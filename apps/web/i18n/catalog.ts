import pt from "./pt-BR.json";
import en from "./en.json";
import es from "./es.json";
import type { Locale } from "./config";
const catalogs: Record<Locale, Record<string, string>> = {
  "pt-BR": pt,
  en,
  es,
};
export function translate(locale: Locale, text: string) {
  const known = catalogs[locale][text];
  if (known) return known;
  if (
    locale !== "en" &&
    /^(?:signal timed out|This operation was aborted\.|The operation was aborted\.)$/.test(
      text,
    )
  )
    return catalogs[locale]["Request timed out."];
  const connected = text.match(/^Server match connected · ([a-f0-9-]+)$/);
  if (connected)
    return `${catalogs[locale]["Server match connected"] ?? "Server match connected"} · ${connected[1]}`;
  return text;
}

export function formatText(locale: Locale, text: string | number) {
  if (typeof text === "number")
    return new Intl.NumberFormat(locale).format(text);
  if (/^-?\d+\.\d+$/.test(text)) {
    const places = Math.min(text.split(".")[1].length, 20);
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: places,
      maximumFractionDigits: places,
    }).format(Number(text));
  }
  return translate(locale, text);
}

export function message(
  locale: Locale,
  key: string,
  values: Record<string, string | number>,
) {
  return translate(locale, key).replace(/\{(\w+)\}/g, (token, name) =>
    String(values[name] ?? token),
  );
}
