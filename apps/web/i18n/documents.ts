import { readFile } from "node:fs/promises";
import path from "node:path";
import { getLocale } from "./server";
const translated = new Set([
  "first-match",
  "differential-drive",
  "camera-and-markers",
  "referee-and-restarts",
  "getting-started",
  "protocol",
  "remote-competition",
  "architecture",
  "private-room-design",
  "security",
  "verification",
  "rules",
  "hardware",
]);
export async function localizeDocument(slug: string, original: string) {
  const locale = await getLocale();
  if (locale === "en" || !translated.has(slug)) return original;
  return readFile(
    path.resolve(process.cwd(), "../../docs/i18n", locale, `${slug}.md`),
    "utf8",
  );
}
