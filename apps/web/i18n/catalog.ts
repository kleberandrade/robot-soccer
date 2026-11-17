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
  return catalogs[locale][text] ?? text;
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
