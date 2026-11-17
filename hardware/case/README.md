# Parametric case concept — Rev A

This is an original, unbuilt packaging proposal. The website loads the generated STL geometry directly. Software checks establish closed manifold surfaces and nominal keepout clearances; they do not establish printability, measured fit, strength, temperature behavior, radio performance or competition compliance.

## Parts and assembly coordinates

- `tray.stl`: 70 × 70 mm exterior, 2 mm floor, 1.6 mm walls, lower wheel windows, nominal N20 rails/strap slots and corner columns. Place at z = 4 mm in the assembly.
- `electronics-deck.stl`: 65.8 mm removable plate with cable slots, clearances over the corner columns, and provisional 39 × 34 mm PCB mounting pattern. Place at z = 30 mm.
- `lid.stl`: 2 mm top plate, four clearance/countersink positions and a flat marker plane. Place at z = 63 mm. Choose actual fasteners and verify heads remain flush.
- `skid.stl`: optional 7 mm diameter, 4 mm tall passive support pad. Adjust support friction and height to the real wheel radius and center of mass.

Each STL starts on its own bed plane. Millimeters are the intended import units. The assembled lid top is 65 mm above the ground plane. The 65 mm roof-marker layout fits the 70 mm top; use a removable tag sheet for service access.

The 65 mm track and 7 mm tires occupy 72 mm across the axle. This is the tire span, not a measurement of all hubs and shaft ends. Inspect the complete bare robot against the selected 75 mm envelope; a case alone does not pass inspection.

## Editable source

`dimensions.json` holds the main design parameters. `generate.py` builds solid geometry with Manifold3D, exports binary STL and writes `mesh-report.json`. The supplied requirements target Python 3.9–3.12; the current artifact generation was verified on Python 3.9.

```sh
python3 -m venv .cad-venv
.cad-venv/bin/pip install -r hardware/case/requirements.txt
.cad-venv/bin/python hardware/case/generate.py
```

Regenerate and inspect all meshes after parameter edits. The accompanying dimension drawing records the committed Rev A layout; revise it when changing the layout. Do not resize a finished STL to compensate for an unmeasured component.

## Packaging assumptions to measure

The battery keepout is a maximum 25 × 45 × 18 mm box behind the drive motors, with its bottom at 8 mm. The pack is not a selected SKU. The carrier is a proposed 45 × 40 mm board above the removable deck; its hole pattern and component height are not a completed PCB design. Motor bodies are nominal 26 × 12 × 10 mm with a 4 mm gap for their back/terminal region. Confirm actual terminals, cable bends, gearbox faces, shaft lengths and hubs.

The 1.8 mm pilot and 2.4 mm clearance holes are prototype dimensions. Test a coupon and adapt them to actual screw type/material. Keep sharp fasteners out of the battery bay. Use a nonconductive case and preserve the module antenna keepout without metal, battery foil or a ground plane in the required region. Switch opening, strain relief, battery retention, printer tolerances, support layout and heat paths remain physical engineering work.

The tray/deck nominal battery-intersection checks and closed-edge checks are recorded in the mesh report. No material density, center of mass, structural simulation or printed prototype is claimed.
