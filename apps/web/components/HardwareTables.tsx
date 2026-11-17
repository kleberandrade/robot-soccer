import { T } from "../i18n/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
async function rows(file: "bom.csv" | "pinmap.csv") {
  const text = await readFile(
    path.resolve(process.cwd(), "../../hardware", file),
    "utf8",
  );
  return text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(","));
}
function Table({
  headers,
  records,
}: {
  headers: string[];
  records: string[][];
}) {
  return (
    <div className="hardware-table-scroll">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>
                <T>{h}</T>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((cells, i) => (
            <tr key={i}>
              {cells.map((cell, j) => (
                <td key={j}>
                  <T>{cell}</T>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default async function HardwareTables() {
  const [bom, pins] = await Promise.all([rows("bom.csv"), rows("pinmap.csv")]);
  return (
    <section className="hardware-tables">
      <h2>
        <T>{"Components and dimension budget"}</T>
      </h2>
      <p>
        <T>
          {
            "The reference list distinguishes selected component families from parts still requiring sourcing and physical validation."
          }
        </T>
      </p>
      <Table
        headers={[
          "Reference",
          "Qty",
          "Component / requirement",
          "Dimensions (mm)",
          "Power / limit",
          "Status",
        ]}
        records={bom}
      />
      <h2>
        <T>{"GPIO and wiring reference"}</T>
      </h2>
      <p>
        <T>
          {
            "These are chip GPIO numbers. Driver standby remains low during reset."
          }
        </T>
      </p>
      <Table
        headers={[
          "ESP32-C3 GPIO",
          "Driver signal",
          "Function",
          "Initial state",
        ]}
        records={pins}
      />
    </section>
  );
}
