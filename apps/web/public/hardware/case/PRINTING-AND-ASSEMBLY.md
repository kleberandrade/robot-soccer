# Printing and assembly guide — ROBOTSOCCER case Rev A

This is an **unprinted, unassembled digital prototype**. Software checks validate meshes, not physical fit, strength, temperature performance or competition compliance. Read before spending material. Start with power disconnected.

## 1. Identify the parts

- `tray.stl`: print one lower tray; 70 × 70 mm exterior, 2 mm floor, 1.6 mm walls, motor guides, wheel openings and corner columns.
- `electronics-deck.stl`: print one removable 65.8 mm plate with cable slots, wheel notches and provisional PCB supports.
- `lid.stl`: print one 2 mm lid with recessed fastener positions and a flat marker surface.
- `skid.stl`: optional 7 mm diameter, 4 mm tall passive pad. Quantity, position, attachment and friction depend on measured balance; no attachment system has been validated.

The ZIP also contains a dimension drawing, parameters, mesh report and editable CAD source. Motors, wheels, battery, PCB, fasteners, wiring and marker sheet are not supplied by the STL files.

## 2. Measure components first

Use calipers and compare with `dimensions.svg`. Nominal motor bodies are 26 × 12 × 10 mm; battery maximum is **25 × 45 × 18 mm**; the proposed carrier is 45 × 40 mm with a provisional 39 × 34 mm hole pattern. These are packaging budgets, not selected and assembled components.

Check terminals, bent wires, shafts, hubs, connectors and switch. The switch opening is provisional. Motor gap, straps and battery retention need testing. Modify the CAD if parts do not fit; scaling an STL changes every dimension and hole together.

## 3. Prepare the slicer

1. Extract the ZIP and import each STL in **millimeters at 100% scale**. Disable automatic fit-to-bed scaling.
2. Check tray footprint 70 × 70 mm and lid 70 × 70 × 2 mm. Each STL has its own Z = 0 bed origin; do not stack the assembly for printing.
3. Proposed orientations to inspect: tray floor down and opening up; deck flat side down and supports up; lid flat underside down and recesses up; skid flat side down.
4. Use the printer and filament manufacturer's profile. A 0.4 mm nozzle and 0.20 mm layer are only an **untested starting proposal**. In the preview, verify that continuous perimeters fill the 1.6 mm walls.
5. Inspect every layer. Wheel-window roofs, switch opening, column collars and supports may require support material. Use localized supports where appropriate and verify they can be removed without breaking parts. Inspect bridges, islands, adhesion and estimated time before printing.

Select a nonconductive material and assess actual heat and stiffness requirements. PLA may be useful for a bench fit prototype; do not assume it tolerates motor or ambient heat. PETG also needs its own profile and tolerances. No material, infill or structural orientation is qualified for this case.

## 4. Test small features first

Create a CAD coupon containing a 1.6 mm wall, 1.8 mm pilot, 2.4 mm clearance hole and your chosen screw recess. This coupon is **not included**. Measure the print and adjust dimensional compensation or CAD. Printing the flat lid first can check outer scale, but does not validate the tray.

Pilot and clearance diameters are provisional. Choose screw type, diameter and length after testing; do not assume any M2 screw will work. There are no designed heat-set insert pockets. Avoid cracked columns and screw tips entering the battery bay.

## 5. Clean and dry-fit

Let parts cool, remove supports and burrs and inspect cracks or delamination. Test deck and lid **without electronics or battery**. The deck must pass over four corner columns and rest on the collars without force. Check aligned holes, wire routes and switch access. Never use a battery as a drilling, sanding or cutting fixture.

## 6. Assemble with power disconnected

1. **Tray and motors:** locate both motors in the nominal guides, shafts facing wheel openings. Design and test retention for the actual motors; guides and slots alone are not validated restraints. Preserve terminal clearance and insulation.
2. **Wheels:** fit selected hubs and wheels; rotate by hand and check tray/deck clearance. Nominal wheel diameter is 32 mm, width up to 7 mm, center-plane separation 65 mm. Tires span 72 mm, but shafts and hubs may protrude farther.
3. **Battery:** first use an inert dummy matching the actual pack. Plan removable retention without cell compression, sharp edges, screw tips or heat sources. The STL does not solve battery retention. Leave power disconnected.
4. **Deck:** lower over the columns onto the collars. Its underside is nominally 30 mm above ground. Check wheel clearance and route wires without trapping them.
5. **Electronics:** compare real board holes before fastening to the supports. Insulate contacts and preserve the module vendor's antenna keepout without nearby metal or battery obstruction. The 45 × 40 mm board is only a space budget; no custom PCB is completed.
6. **Lid and markers:** test screw length and keep heads flush. Nominal lid top is 65 mm above ground. Apply the 65 mm marker layout without blocking maintenance access, respecting the selected team orientation.
7. **Support and balance:** assess stability with the real component mass. If using passive skids, determine location, height and attachment while retaining traction load on both drive wheels. Attachment and friction remain to be tested.

Ground-relative assembly positions are tray Z = 4 mm, deck Z = 30 mm, lid Z = 63 mm. Each part still sits individually at Z = 0 in the slicer.

## 7. Inspect before energizing

Check free wheel movement; secure components; no sharp fasteners, debris, shorts, pinched wiring or battery pressure; accessible switch; removable lid. Measure the complete robot, including hubs, shafts and screws, against the selected competition envelope. A case alone does not establish compliance.

Review polarity, power and every connection with the electronic diagram. First electrical checks require suspended wheels, accessible shutdown and an appropriate supervised bench procedure. The default firmware with an empty key disables motor actuation. Then evaluate heat, vibration, retention and low-speed motion; record changes before competition.

## 8. Record and revise

Save printer, material, profile, orientation, dimensions, mass and fit photos. Edit `dimensions.json` and regenerate with `generate.py` and pinned `requirements.txt` using Python 3.9–3.12. Revise the dimension drawing when changing layout. `mesh-report.json` records geometry checks only; it cannot replace printing or assembly tests.

Project: https://robot-soccer.vercel.app/en/hardware/case
Electronics: https://robot-soccer.vercel.app/en/hardware/electronics
