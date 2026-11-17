import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
export const metadata: Metadata = {
  title: "Electronic diagram | ROBOTSOCCER",
  description:
    "Inspect the detailed power path, ESP32 module pads, TB6612FNG pins, motor outputs and reset/programming reference.",
};
export default function Electronics() {
  return (
    <div className="public-site">
      <SiteHeader active="/hardware" />
      <main className="hardware-wide">
        <Link className="breadcrumb" href="/hardware">
          Hardware reference / Electronics
        </Link>
        <header className="hardware-page-title">
          <span className="section-kicker">ELECTRICAL REFERENCE / REV B</span>
          <h1>
            Follow every signal.
            <br />
            Understand every rail.
          </h1>
          <p>
            A readable connection-level diagram with module pad numbers, driver
            pins, local decoupling and the programming interface.
          </p>
        </header>
        <div className="document-banner">
          <span>REFERENCE PROPOSAL</span>
          <p>
            This is an original educational schematic and connection schedule.
            It is not a PCB layout, ERC-approved manufacturing netlist or
            bench-validated circuit. Dashed power stages still require real-part
            selection.
          </p>
        </div>
        <div className="schematic-actions">
          <a className="site-button solid" href="/hardware/electronics.svg">
            Open full-size schematic
          </a>
          <a
            className="site-button outline"
            href="/hardware/electronics.svg"
            download
          >
            Download SVG
          </a>
          <a
            className="site-button outline"
            href="/hardware/connections.csv"
            download
          >
            Connection schedule
          </a>
        </div>
        <div className="schematic-sheet">
          <object
            type="image/svg+xml"
            data="/hardware/electronics.svg"
            aria-label="Detailed electronic diagram with power protection, ESP32, motor driver, motors and programming"
          >
            <a href="/hardware/electronics.svg">Open schematic</a>
          </object>
        </div>
        <section className="firmware-steps">
          <article>
            <span>POWER</span>
            <h3>Two regulated rails.</h3>
            <p>
              The protected battery feeds separate 5 V motor and 3.3 V logic
              regulators. Keep motor return loops away from logic and RF
              routing.
            </p>
          </article>
          <article>
            <span>CONTROL</span>
            <h3>GPIO is not a pad number.</h3>
            <p>
              The drawing distinguishes ESP32 GPIOs, MINI-1 module pads and
              TB6612FNG package pins. Join duplicated motor output and supply
              pins.
            </p>
          </article>
          <article>
            <span>INITIAL STATE</span>
            <h3>Standby is held low.</h3>
            <p>
              An external 10 kΩ pulldown complements firmware shutdown. Reset
              and boot have their own named networks.
            </p>
          </article>
        </section>
        <section className="hardware-article">
          <h2>Read the drawing in four passes</h2>
          <ol>
            <li>
              Start at J1 and follow the protected supply path through the fuse,
              switch, reverse-polarity stage and low-voltage cutoff. Dashed
              blocks are selection requirements.
            </li>
            <li>
              Trace +5V_MOTOR to all VM pins and +3V3 to the module and driver
              logic. Locate the local capacitors beside each device and the
              motor-rail bulk capacitor.
            </li>
            <li>
              Match the seven GPIO signals to direction, PWM and standby pins.
              The motor wires connect only to the driver outputs.
            </li>
            <li>
              Inspect EN, boot strapping and the 3.3 V UART service header. Its
              voltage reference is sense-only; do not backfeed the regulator
              from the programmer.
            </li>
          </ol>
          <h2>What the picture cannot validate</h2>
          <p>
            The protection board, battery, switch and reverse-polarity part
            still need real SKUs, dimensions and operating limits. Confirm
            wiring gauge, inrush, thermal derating, cutoff hysteresis and
            motor-rail overshoot. The bulk capacitor alone does not establish
            regenerative-braking protection. Complete schematic capture, PCB
            layout, ERC and supervised bench tests before energizing motors.
          </p>
          <p>
            All GND symbols are the same electrical net. Their physical trace
            arrangement must keep high motor currents out of module return
            paths. Follow the vendor antenna keepout and use the{" "}
            <Link href="/hardware/case">case model</Link> as a packaging budget,
            not a validated RF layout.
          </p>
          <h2>Primary references used</h2>
          <p>
            Pad labels were checked against the{" "}
            <a href="https://documentation.espressif.com/esp32-c3-mini-1_datasheet_en.html">
              ESP32-C3-MINI-1 datasheet
            </a>
            . Startup and decoupling guidance comes from{" "}
            <a href="https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/schematic-checklist.html">
              Espressif's schematic checklist
            </a>
            . Driver pin functions and supply connections were checked against
            the{" "}
            <a href="https://toshiba.semicon-storage.com/info/datasheet_en_20141001.pdf?did=10660">
              Toshiba TB6612FNG datasheet
            </a>
            . Check the exact selected device revision before building.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
