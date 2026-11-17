import assert from "node:assert/strict";
const base = process.env.BASE_URL ?? "http://127.0.0.1:3107";
const pages = [
  "/",
  "/lab",
  "/compete",
  "/rules",
  "/hardware",
  "/hardware/electronics",
  "/hardware/case",
  "/hardware/firmware",
  "/docs",
  "/docs/first-match",
  "/docs/differential-drive",
  "/docs/camera-and-markers",
  "/docs/referee-and-restarts",
  "/docs/getting-started",
  "/docs/protocol",
  "/docs/remote-competition",
  "/docs/architecture",
  "/docs/private-room-design",
  "/docs/security",
  "/docs/verification",
];
for (const page of pages) {
  const r = await fetch(base + page);
  assert.equal(r.status, 200, page);
  const html = await r.text();
  assert(/<h1[ >]/.test(html), page);
}
for (const asset of [
  "electronics.svg",
  "wiring.svg",
  "connections.csv",
  "case/dimensions.svg",
  "case/mesh-report.json",
  "firmware/main.cpp",
  "firmware/protocol.h",
  "firmware/secrets.example.h",
  "firmware/platformio.ini",
]) {
  const r = await fetch(`${base}/hardware/${asset}`);
  assert.equal(r.status, 200, asset);
}
for (const name of ["tray", "lid", "electronics-deck", "skid"]) {
  const r = await fetch(`${base}/hardware/case/${name}.stl`);
  assert.equal(r.status, 200);
  const bytes = new Uint8Array(await r.arrayBuffer()),
    view = new DataView(bytes.buffer);
  assert.equal(bytes.length, 84 + view.getUint32(80, true) * 50);
}
assert.equal((await fetch(`${base}/hardware/firmware/secrets.h`)).status, 404);
console.log(
  JSON.stringify({
    base,
    pages: pages.length,
    engineeringDownloads: "verified",
    privateFirmwareSecrets: "not published",
  }),
);
