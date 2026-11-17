import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import FirmwareSources from "../../../components/FirmwareSources";
export const metadata: Metadata = {
  title: "ESP32 robot firmware | ROBOTSOCCER",
  description:
    "Read and download the actual ESP32-C3 robot code, command parser, build configuration and empty local-secret template.",
};
export default function FirmwarePage() {
  return (
    <div className="public-site">
      <SiteHeader active="/hardware" />
      <main className="hardware-wide">
        <Link className="breadcrumb" href="/hardware">
          Hardware reference / Robot firmware
        </Link>
        <header className="hardware-page-title">
          <span className="section-kicker">
            ACTUAL PROJECT SOURCE / ESP32-C3
          </span>
          <h1>
            The code inside
            <br />
            the robot.
          </h1>
          <p>
            The complete reference firmware, shown directly from the project
            files. Follow the control loop, inspect the parser, and build it
            locally.
          </p>
        </header>
        <div className="document-banner">
          <span>COMPILED REFERENCE / PHYSICAL VALIDATION PENDING</span>
          <p>
            The embedded build and native parser tests have been checked. Real
            motor polarity, radio range, cutoff and closed-loop speed control
            have not been validated.
          </p>
        </div>
        <section className="firmware-steps">
          <article>
            <span>01 / BOOT</span>
            <h3>Keep the bridge off.</h3>
            <p>
              STBY starts low. Missing credentials leave the robot in safe mode.
            </p>
          </article>
          <article>
            <span>02 / RECEIVE</span>
            <h3>Trust only valid commands.</h3>
            <p>
              Robot ID, sequence, speed, TTL and HMAC must all pass before motor
              enable.
            </p>
          </article>
          <article>
            <span>03 / STOP</span>
            <h3>Let silence stop motion.</h3>
            <p>
              The driver is disabled when the command expires or WLAN
              disconnects.
            </p>
          </article>
        </section>
        <section className="hardware-article">
          <h2>Build the reference</h2>
          <pre>
            <code>{`python3 -m venv .tools-venv\n.tools-venv/bin/pip install platformio==6.2.0\nPLATFORMIO_CORE_DIR="$PWD/.pio-core" .tools-venv/bin/pio run -d firmware\nnpm run test:firmware`}</code>
          </pre>
          <p>
            The pinned target is ESP32-C3-DevKitM-1 with Espressif32 6.12.0 /
            Arduino 2.0.17. Compilation verifies the MCU-family build; it does
            not validate a custom carrier board. Read the{" "}
            <Link href="/hardware/electronics">electronic reference</Link>{" "}
            before wiring.
          </p>
          <h2>Configure one robot at a time</h2>
          <p>
            Copy <code>firmware/include/secrets.example.h</code> to ignored{" "}
            <code>secrets.h</code>. Set WLAN credentials and a separately
            generated 32-byte radio key encoded as 64 hexadecimal characters for
            each robot. Choose ROBOT_ID 0, 1 or 2 in its build flags. Never
            commit the real file.
          </p>
          <p>
            <strong>
              Competition room keys and physical radio keys are different
              credentials.
            </strong>{" "}
            The private-room client controls the simulation. Physical radio uses
            a separately supervised bridge, its own per-robot HMAC keys and
            real-time packet deadlines. The default bridge remains dry-run.
          </p>
          <h2>Understand the limit of the drive code</h2>
          <p>
            The motor function maps requested wheel speed to PWM duty. It has no
            encoder feedback, speed measurement, PID or battery-voltage
            compensation. A packet acknowledgement reports the applied command,
            not measured motion. Use the external power switch and keep motor
            supply off while programming; GPIO4–7 must not be used for JTAG
            while motors are armed.
          </p>
        </section>
        <FirmwareSources />
      </main>
      <SiteFooter />
    </div>
  );
}
