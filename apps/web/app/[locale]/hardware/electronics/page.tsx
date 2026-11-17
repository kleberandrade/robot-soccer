import { getTranslator } from "../../../../i18n/server";

import { T } from "../../../../i18n/client";
import type { Metadata } from "next";
import { LocalLink as Link } from "../../../../i18n/client";
import SiteHeader from "../../../../components/SiteHeader";
import SiteFooter from "../../../../components/SiteFooter";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: t("Electronic diagram | ROBOTSOCCER"),
    description: t(
      "Inspect the detailed power path, ESP32 module pads, TB6612FNG pins, motor outputs and reset/programming reference.",
    ),
  };
}
export default async function Electronics() {
  const t = await getTranslator();
  return (
    <div className="public-site">
      <SiteHeader active="/hardware" />
      <main className="hardware-wide">
        <Link className="breadcrumb" href="/hardware">
          <T>{"Hardware reference / Electronics"}</T>
        </Link>
        <header className="hardware-page-title">
          <span className="section-kicker">
            <T>{"ELECTRICAL REFERENCE / REV B"}</T>
          </span>
          <h1>
            <T>{"Follow every signal."}</T>
            <br />
            <T>{"Understand every rail."}</T>
          </h1>
          <p>
            <T>
              {
                "A readable connection-level diagram with module pad numbers, driver pins, local decoupling and the programming interface."
              }
            </T>
          </p>
        </header>
        <div className="document-banner">
          <span>
            <T>{"REFERENCE PROPOSAL"}</T>
          </span>
          <p>
            <T>
              {
                "This is an original educational schematic and connection schedule. It is not a PCB layout, ERC-approved manufacturing netlist or bench-validated circuit. Dashed power stages still require real-part selection."
              }
            </T>
          </p>
        </div>
        <div className="schematic-actions">
          <a className="site-button solid" href="/hardware/electronics.svg">
            <T>{"Open full-size schematic"}</T>
          </a>
          <a
            className="site-button outline"
            href="/hardware/electronics.svg"
            download
          >
            <T>{"Download SVG"}</T>
          </a>
          <a
            className="site-button outline"
            href="/hardware/connections.csv"
            download
          >
            <T>{"Connection schedule"}</T>
          </a>
        </div>
        <div className="schematic-sheet">
          <object
            type="image/svg+xml"
            data="/hardware/electronics.svg"
            aria-label={t(
              "Detailed electronic diagram with power protection, ESP32, motor driver, motors and programming",
            )}
          >
            <a href="/hardware/electronics.svg">
              <T>{"Open schematic"}</T>
            </a>
          </object>
        </div>
        <section className="firmware-steps">
          <article>
            <span>
              <T>{"POWER"}</T>
            </span>
            <h3>
              <T>{"Two regulated rails."}</T>
            </h3>
            <p>
              <T>
                {
                  "The protected battery feeds separate 5 V motor and 3.3 V logic regulators. Keep motor return loops away from logic and RF routing."
                }
              </T>
            </p>
          </article>
          <article>
            <span>
              <T>{"CONTROL"}</T>
            </span>
            <h3>
              <T>{"GPIO is not a pad number."}</T>
            </h3>
            <p>
              <T>
                {
                  "The drawing distinguishes ESP32 GPIOs, MINI-1 module pads and TB6612FNG package pins. Join duplicated motor output and supply pins."
                }
              </T>
            </p>
          </article>
          <article>
            <span>
              <T>{"INITIAL STATE"}</T>
            </span>
            <h3>
              <T>{"Standby is held low."}</T>
            </h3>
            <p>
              <T>
                {
                  "An external 10 kΩ pulldown complements firmware shutdown. Reset and boot have their own named networks."
                }
              </T>
            </p>
          </article>
        </section>
        <section className="hardware-article">
          <h2>
            <T>{"Read the drawing in four passes"}</T>
          </h2>
          <ol>
            <li>
              <T>
                {
                  "Start at J1 and follow the protected supply path through the fuse, switch, reverse-polarity stage and low-voltage cutoff. Dashed blocks are selection requirements."
                }
              </T>
            </li>
            <li>
              <T>
                {
                  "Trace +5V_MOTOR to all VM pins and +3V3 to the module and driver logic. Locate the local capacitors beside each device and the motor-rail bulk capacitor."
                }
              </T>
            </li>
            <li>
              <T>
                {
                  "Match the seven GPIO signals to direction, PWM and standby pins. The motor wires connect only to the driver outputs."
                }
              </T>
            </li>
            <li>
              <T>
                {
                  "Inspect EN, boot strapping and the 3.3 V UART service header. Its voltage reference is sense-only; do not backfeed the regulator from the programmer."
                }
              </T>
            </li>
          </ol>
          <h2>
            <T>{"What the picture cannot validate"}</T>
          </h2>
          <p>
            <T>
              {
                "The protection board, battery, switch and reverse-polarity part still need real SKUs, dimensions and operating limits. Confirm wiring gauge, inrush, thermal derating, cutoff hysteresis and motor-rail overshoot. The bulk capacitor alone does not establish regenerative-braking protection. Complete schematic capture, PCB layout, ERC and supervised bench tests before energizing motors."
              }
            </T>
          </p>
          <p>
            <T>
              {
                "All GND symbols are the same electrical net. Their physical trace arrangement must keep high motor currents out of module return paths. Follow the vendor antenna keepout and use the"
              }
            </T>
            <T> </T>
            <Link href="/hardware/case">
              <T>{"case model"}</T>
            </Link>
            <T>{"as a packaging budget, not a validated RF layout."}</T>
          </p>
          <h2>
            <T>{"Primary references used"}</T>
          </h2>
          <p>
            <T>{"Pad labels were checked against the"}</T>
            <T> </T>
            <a href="https://documentation.espressif.com/esp32-c3-mini-1_datasheet_en.html">
              <T>{"ESP32-C3-MINI-1 datasheet"}</T>
            </a>
            <T>{". Startup and decoupling guidance comes from"}</T>
            <T> </T>
            <a href="https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/schematic-checklist.html">
              <T>{"Espressif's schematic checklist"}</T>
            </a>
            <T>
              {
                ". Driver pin functions and supply connections were checked against the"
              }
            </T>
            <T> </T>
            <a href="https://toshiba.semicon-storage.com/info/datasheet_en_20141001.pdf?did=10660">
              <T>{"Toshiba TB6612FNG datasheet"}</T>
            </a>
            <T>
              {". Check the exact selected device revision before building."}
            </T>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
