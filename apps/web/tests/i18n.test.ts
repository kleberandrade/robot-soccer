import { describe, expect, it } from "vitest";
import { isLocale, localizedPath, stripLocale } from "../i18n/config";
import { translate, formatText } from "../i18n/catalog";
import pt from "../i18n/pt-BR.json";
import es from "../i18n/es.json";
describe("localization routes and formatting", () => {
  it("accepts only the three supported locales", () => {
    expect(["pt-BR", "en", "es"].every(isLocale)).toBe(true);
    expect(["pt", "fr", "EN", "../en", undefined].some(isLocale)).toBe(false);
  });
  it("replaces language prefixes while preserving query and hash", () => {
    expect(
      localizedPath("/pt-BR/hardware/case?view=1#guia-impressao", "es"),
    ).toBe("/es/hardware/case?view=1#guia-impressao");
    expect(localizedPath("/en?view=1", "pt-BR")).toBe("/pt-BR?view=1");
    expect(stripLocale("/es")).toBe("/");
    expect(localizedPath("/docs", "en")).toBe("/en/docs");
  });
  it("never localizes APIs, downloads, external or fragment URLs", () => {
    for (const path of [
      "/api/rooms",
      "/_next/static/chunk.js",
      "/hardware/case/tray.stl",
      "/hardware/case/robot-soccer-case-rev-a.zip",
      "https://example.com/en",
      "//example.com",
      "#assembly",
    ])
      expect(localizedPath(path, "es")).toBe(path);
  });
  it("keeps source-language fallback and machine identifiers intact", () => {
    expect(translate("en", "Start match")).toBe("Start match");
    expect(translate("pt-BR", "Start match")).toBe("Iniciar partida");
    expect(translate("es", "Start match")).toBe("Iniciar partido");
    expect(translate("es", "blue-0")).toBe("blue-0");
    expect(translate("en", "Baixar todos os STL + guia (ZIP)")).toBe(
      "Download all STL + guide (ZIP)",
    );
  });
  it("formats user-facing decimal measurements for the selected locale", () => {
    expect(formatText("pt-BR", "1.50")).toBe("1,50");
    expect(formatText("es", "1.50")).toBe("1,50");
    expect(formatText("en", "1.50")).toBe("1.50");
    expect(formatText("pt-BR", "00:12")).toBe("00:12");
  });
  it("keeps Portuguese and Spanish catalogs aligned without empty entries", () => {
    expect(Object.keys(pt).sort()).toEqual(Object.keys(es).sort());
    expect(Object.values(pt).every(Boolean)).toBe(true);
    expect(Object.values(es).every(Boolean)).toBe(true);
  });
});
