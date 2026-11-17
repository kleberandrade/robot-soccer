import { readFile } from "node:fs/promises";
import path from "node:path";
const sources = [
  {
    file: "main.cpp",
    source: "../../firmware/src/main.cpp",
    title: "1. Main control loop",
    summary:
      "Boot with the driver disabled, authenticate radio packets, apply wheel commands, and stop on expiry or WLAN loss.",
  },
  {
    file: "protocol.h",
    source: "../../firmware/include/protocol.h",
    title: "2. Bounded command parser",
    summary:
      "Check packet length, magic/version, robot identity, speed range and the command deadline.",
  },
  {
    file: "platformio.ini",
    source: "../../firmware/platformio.ini",
    title: "3. Reproducible build configuration",
    summary:
      "Pinned ESP32 platform and the ESP32-C3 development-board target. Set ROBOT_ID independently for each robot.",
  },
  {
    file: "secrets.example.h",
    source: "../../firmware/include/secrets.example.h",
    title: "4. Local configuration template",
    summary:
      "An intentionally empty radio key keeps the default build in safe mode. Real secrets.h is ignored and never published.",
  },
];
export default async function FirmwareSources() {
  const files = await Promise.all(
    sources.map(async (s) => ({
      ...s,
      code: await readFile(
        path.resolve(process.cwd(), "public/hardware/firmware", s.file),
        "utf8",
      ),
    })),
  );
  return (
    <div className="firmware-files">
      {files.map((s, i) => (
        <section key={s.file}>
          <header>
            <div>
              <h2>{s.title}</h2>
              <p>{s.summary}</p>
            </div>
            <a href={`/hardware/firmware/${s.file}`} download>
              Download {s.file}
            </a>
          </header>
          <details open={i === 0}>
            <summary>{s.file}</summary>
            <pre>
              <code>{s.code}</code>
            </pre>
          </details>
        </section>
      ))}
    </div>
  );
}
