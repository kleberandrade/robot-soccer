import { getTranslator } from "../../../../i18n/server";

import { T } from "../../../../i18n/client";
import { LocalLink as Link } from "../../../../i18n/client";
import type { Metadata } from "next";
import SiteHeader from "../../../../components/SiteHeader";
import SiteFooter from "../../../../components/SiteFooter";
import FirmwareSources from "../../../../components/FirmwareSources";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: t("ESP32 robot firmware | ROBOTSOCCER"),
    description: t(
      "Read and download the actual ESP32-C3 robot code, command parser, build configuration and empty local-secret template.",
    ),
  };
}
export default function FirmwarePage() {
  return (
    <div className="public-site">
      <SiteHeader active="/hardware" />
      <main className="hardware-wide">
        <Link className="breadcrumb" href="/hardware">
          <T>{"Hardware reference / Robot firmware"}</T>
        </Link>
        <header className="hardware-page-title">
          <span className="section-kicker">
            <T>{"ACTUAL PROJECT SOURCE / ESP32-C3"}</T>
          </span>
          <h1>
            <T>{"The code inside"}</T>
            <br />
            <T>{"the robot."}</T>
          </h1>
          <p>
            <T>
              {
                "The complete reference firmware, shown directly from the project files. Follow the control loop, inspect the parser, and build it locally."
              }
            </T>
          </p>
        </header>
        <div className="document-banner">
          <span>
            <T>{"COMPILED REFERENCE / PHYSICAL VALIDATION PENDING"}</T>
          </span>
          <p>
            <T>
              {
                "The embedded build and native parser tests have been checked. Real motor polarity, radio range, cutoff and closed-loop speed control have not been validated."
              }
            </T>
          </p>
        </div>
        <section className="firmware-steps">
          <article>
            <span>
              <T>{"01 / BOOT"}</T>
            </span>
            <h3>
              <T>{"Keep the bridge off."}</T>
            </h3>
            <p>
              <T>
                {
                  "STBY starts low. Missing credentials leave the robot in safe mode."
                }
              </T>
            </p>
          </article>
          <article>
            <span>
              <T>{"02 / RECEIVE"}</T>
            </span>
            <h3>
              <T>{"Trust only valid commands."}</T>
            </h3>
            <p>
              <T>
                {
                  "Robot ID, sequence, speed, TTL and HMAC must all pass before motor enable."
                }
              </T>
            </p>
          </article>
          <article>
            <span>
              <T>{"03 / STOP"}</T>
            </span>
            <h3>
              <T>{"Let silence stop motion."}</T>
            </h3>
            <p>
              <T>
                {
                  "The driver is disabled when the command expires or WLAN disconnects."
                }
              </T>
            </p>
          </article>
        </section>
        <section className="hardware-article">
          <h2>
            <T>{"Build the reference"}</T>
          </h2>
          <pre>
            <code>{`python3 -m venv .tools-venv\n.tools-venv/bin/pip install platformio==6.2.0\nPLATFORMIO_CORE_DIR="$PWD/.pio-core" .tools-venv/bin/pio run -d firmware\nnpm run test:firmware`}</code>
          </pre>
          <p>
            <T>
              {
                "The pinned target is ESP32-C3-DevKitM-1 with Espressif32 6.12.0 / Arduino 2.0.17. Compilation verifies the MCU-family build; it does not validate a custom carrier board. Read the"
              }
            </T>
            <T> </T>
            <Link href="/hardware/electronics">
              <T>{"electronic reference"}</T>
            </Link>
            <T> </T>
            <T>{"before wiring."}</T>
          </p>
          <h2>
            <T>{"Configure one robot at a time"}</T>
          </h2>
          <p>
            <T>{"Copy"}</T>
            <code>firmware/include/secrets.example.h</code>
            <T>{"to ignored"}</T>
            <T> </T>
            <code>secrets.h</code>
            <T>
              {
                ". Set WLAN credentials and a separately generated 32-byte radio key encoded as 64 hexadecimal characters for each robot. Choose ROBOT_ID 0, 1 or 2 in its build flags. Never commit the real file."
              }
            </T>
          </p>
          <p>
            <strong>
              <T>
                {
                  "Competition room keys and physical radio keys are different credentials."
                }
              </T>
            </strong>
            <T> </T>
            <T>
              {
                "The private-room client controls the simulation. Physical radio uses a separately supervised bridge, its own per-robot HMAC keys and real-time packet deadlines. The default bridge remains dry-run."
              }
            </T>
          </p>
          <h2>
            <T>{"Understand the limit of the drive code"}</T>
          </h2>
          <p>
            <T>
              {
                "The motor function maps requested wheel speed to PWM duty. It has no encoder feedback, speed measurement, PID or battery-voltage compensation. A packet acknowledgement reports the applied command, not measured motion. Use the external power switch and keep motor supply off while programming; GPIO4–7 must not be used for JTAG while motors are armed."
              }
            </T>
          </p>
        </section>
        <FirmwareSources />
      </main>
      <SiteFooter />
    </div>
  );
}
