# ESP32-C3 reference robot — unbuilt design

This is an original wiring/mechanical proposal for a differential-drive robot. No PCB has been fabricated, motors energized, radio range measured or mechanical envelope physically validated. Do not treat the SVG as a fabrication netlist. Complete schematic/layout/ERC, part sourcing, thermal and assembly review before manufacturing.

## Envelope and packaging budget

Target **70 × 70 × 65 mm bare**, leaving 5 mm total margin relative to the user's 75 mm cube. A removable thin uniform must stay inside 80 mm. Two transverse, back-to-back micro gearmotors (approximately 26 × 12 × 10 mm bodies) occupy about 52 mm across the chassis; two 7 mm wide wheels bring the nominal width to 66 mm. Verify shaft/hub engagement and actual motor length before cutting the chassis. Wheel diameter is 32 mm and the provisional track is 65 mm. The simulator renders 75 mm bodies and uses a conservative 53 mm contact radius; it does not duplicate this chassis exactly.

Allocate a lower motor deck, a protected battery bay of **at most 45 × 25 × 18 mm**, and an upper **45 × 40 mm custom carrier** with the ESP32-C3-MINI-1 antenna facing a non-metallic edge. A 10 mm wiring/connector allowance and antenna keepout are required. This is a stacking budget, not a validated CAD assembly. A full development board is a bench substitute; use the MINI-1 module/carrier for the size proposal.

## Electrical reference

See [wiring.svg](wiring.svg), [bom.csv](bom.csv), and [pinmap.csv](pinmap.csv). All signal grounds and power returns join at the protected supply star point. Motors connect only to the TB6612FNG outputs. GPIO drives logic inputs, never motors. STBY has an external 10 kΩ pulldown so reset/boot leaves the bridge disabled.

Use a protected **2S LiPo** supply (6.4–8.4 V operating target), an accessible mechanical power switch, a 1 A fuse, reverse-polarity protection, a 5 V motor buck and a separate 3.3 V logic buck. The driver VCC is 3.3 V and VM is 5 V. The motor choice is **6 V low-power Pololu micro metal gearmotors**, operated below nominal voltage. Their specified stall current is 0.36 A at 6 V; two motors are within the proposed 1 A motor-regulator budget at 5 V in the ideal electrical estimate, but thermal derating, stall duration and peak current require bench verification. Do not substitute high-power N20 motors based only on dimensions.

The TB6612FNG's 1.2 A average/3.2 A peak absolute ratings are not continuous design targets; use its operating/thermal curves. A suitable carrier must tie all corresponding power/ground/output pins correctly. Add 100 nF close to driver VCC, 100 nF + 470 µF on VM, 100 nF across each motor, local module decoupling per Espressif, and regulator input decoupling per Pololu. Keep motor loops short and away from the antenna.

The battery, protection/cutoff board, switch and connector are **selection gates** in the BOM: source a real part with dimensions and chemistry-compatible cell protection before building. The 45 × 25 × 18 mm battery bay is a design constraint, not a claimed measured battery SKU. Set a separate hardware low-voltage cutoff around 6.4 V with suitable hysteresis and follow the selected cell manufacturer's limits; firmware currently does not measure battery voltage. Use an external balance charger with the pack removed. There is no charging circuit in this design. Do not power the 3.3 V module from the raw battery or backfeed USB/programming power.

GPIO assignment: AIN1=0, AIN2=1, PWMA=3, BIN1=4, BIN2=5, PWMB=6, STBY=7. These are chip GPIO numbers, not arbitrary board labels. Keep boot-strapping pins 2/8/9 out of the drive interface. GPIO 4–7 share alternate debug functions; debug configuration and board routing must preserve the driver disable state. Add EN pullup/reset, boot GPIO9 pullup/button, and programming/debug connections per the official module hardware-design guidance. The compact custom carrier is not yet laid out.

## Firmware and radio

```sh
python3 -m venv .tools-venv
.tools-venv/bin/pip install platformio==6.2.0
PLATFORMIO_CORE_DIR="$PWD/.pio-core" .tools-venv/bin/pio run -d firmware
npm run test:firmware
```

The build is pinned to PlatformIO Espressif32 6.12.0 / Arduino ESP32 2.0.17 using the ESP32-C3-DevKitM-1 target. This validates compilation for the same MCU/module family; it does not certify a custom carrier. Default configuration compiles in safe mode because the radio key is empty. Copy `firmware/include/secrets.example.h` to ignored `secrets.h`, set WLAN credentials and a different 64-character hex key per robot, and set `ROBOT_ID=0`, `1` or `2` in build flags. Do not commit these settings.

A valid authenticated packet enables the driver. A command deadline of at most 250 ms, WLAN loss, reset, or an unconfigured key leaves/disables STBY. Speeds are converted to PWM duty by an uncalibrated open-loop map (600 mm/s → 255); this is **not measured velocity control**. Encoders, PID and odometry are not implemented. The signed-command radio/bridge format is specified in [PROTOCOL.md](../docs/PROTOCOL.md). No real hardware was contacted during development.

## Primary component references checked

- [ESP32-C3 datasheet](https://documentation.espressif.com/esp32-c3_datasheet_en.html) and [ESP32-C3-MINI-1 module](https://documentation.espressif.com/esp32-c3-mini-1_datasheet_en.pdf). MINI-1 is approximately 13.2 × 16.6 × 2.4 mm; preserve the vendor footprint/antenna keepout.
- [Toshiba TB6612FNG product/datasheet](https://toshiba.semicon-storage.com/eu/semiconductor/product/general-purpose-logic-ics/detail.TB6612FNG.html). Dual brushed-motor full bridge; VCC operating 2.7–5.5 V and VM 2.5–13.5 V support the proposed 3.3/5 V rails.
- [Pololu low-power 6 V motors](https://www.pololu.com/category/171/6v-low-power-lp-micro-metal-gearmotors) and [motor data](https://www.pololu.com/file/0J1487/pololu-micro-metal-gearmotors-rev-4-1.pdf). Choose gearing based on measured speed/torque, not simulation speed.
- [5 V D24V10F5 regulator](https://www.pololu.com/product/2831/specs) and [3.3 V D24V10F3 regulator](https://www.pololu.com/product/2830/resources). Approximately 12.7 × 17.8 × 3.56 mm each, excluding headers; verify dropout and thermal derating at battery minimum.
