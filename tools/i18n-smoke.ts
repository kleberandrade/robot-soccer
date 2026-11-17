import assert from "node:assert/strict";
const base = process.env.BASE_URL ?? "http://127.0.0.1:3107";
const paths = [
  "",
  "/lab",
  "/compete",
  "/docs",
  "/rules",
  "/privacy",
  "/terms",
  "/contributing",
  "/hardware",
  "/hardware/case",
  "/hardware/electronics",
  "/hardware/firmware",
  ...[
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
  ].map((p) => `/docs/${p}`),
];
const labels = {
  "pt-BR": ["Pequenos robôs.", "Laboratório", "Guia de impressão e montagem"],
  en: ["Small robots.", "Laboratory", "Printing and assembly guide"],
  es: ["Pequeños robots.", "Laboratorio", "Guía de impresión y montaje"],
};
for (const [locale, expected] of Object.entries(labels)) {
  for (const path of paths) {
    const response = await fetch(`${base}/${locale}${path}`);
    assert.equal(response.status, 200, `${locale}${path}`);
    assert.equal(new URL(response.url).pathname, `/${locale}${path}`);
    const html = await response.text();
    assert(
      html.includes(`<html lang="${locale}"`),
      `${locale}${path}: document language`,
    );
    assert(
      html.includes(`href="/${locale}/lab"`),
      `${locale}${path}: localized navigation`,
    );
    assert(
      html.includes(expected[1]),
      `${locale}${path}: translated navigation`,
    );
    if (!path) assert(html.includes(expected[0]));
    if (path === "/hardware/case") assert(html.includes(expected[2]));
  }
}
const redirect = await fetch(`${base}/lab?example=1`, {
  redirect: "manual",
  headers: { cookie: "rs-locale=es" },
});
assert.equal(redirect.status, 307);
assert.equal(
  new URL(redirect.headers.get("location")!, base).pathname,
  "/es/lab",
);
assert.equal(
  new URL(redirect.headers.get("location")!, base).search,
  "?example=1",
);
const invalid = await fetch(`${base}/lab`, {
  redirect: "manual",
  headers: { cookie: "rs-locale=invalid" },
});
assert.equal(
  new URL(invalid.headers.get("location")!, base).pathname,
  "/pt-BR/lab",
);
const missing = await fetch(`${base}/en/docs/not-an-article`);
// Next.js may have started streaming the shared layout before notFound().
const missingHtml = await missing.text();
assert(
  missing.status === 404 ||
    missingHtml.includes("NEXT_HTTP_ERROR_FALLBACK;404"),
);
assert(missingHtml.includes("noindex"));
assert.equal(
  (
    await fetch(`${base}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Unauthorized localization test" }),
    })
  ).status,
  401,
);
console.log(
  JSON.stringify({
    base,
    localizedPages: paths.length * 3,
    localePreference: "verified",
    apiAccess: "unlocalized authentication preserved",
  }),
);
