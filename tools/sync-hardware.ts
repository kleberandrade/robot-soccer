import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  target = path.join(root, "apps/web/public/hardware");
const files = [
  ["hardware/wiring.svg", "wiring.svg"],
  ["hardware/bom.csv", "bom.csv"],
  ["hardware/pinmap.csv", "pinmap.csv"],
  ["hardware/electronics.svg", "electronics.svg"],
  ["hardware/connections.csv", "connections.csv"],
  ["hardware/case/dimensions.json", "case/dimensions.json"],
  ["hardware/case/mesh-report.json", "case/mesh-report.json"],
  ["hardware/case/generate.py", "case/generate.py"],
  ["hardware/case/requirements.txt", "case/requirements.txt"],
  ["hardware/case/dimensions.svg", "case/dimensions.svg"],
  ...["tray", "lid", "electronics-deck", "skid"].map((n) => [
    `hardware/case/${n}.stl`,
    `case/${n}.stl`,
  ]),
  ["firmware/src/main.cpp", "firmware/main.cpp"],
  ["firmware/include/protocol.h", "firmware/protocol.h"],
  ["firmware/include/secrets.example.h", "firmware/secrets.example.h"],
  ["firmware/platformio.ini", "firmware/platformio.ini"],
];
for (const [source, destination] of files) {
  await mkdir(path.dirname(path.join(target, destination)), {
    recursive: true,
  });
  await copyFile(path.join(root, source), path.join(target, destination));
}
console.log("Synchronized public hardware and example-only firmware sources.");
