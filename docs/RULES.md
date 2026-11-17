# Selected VSSS reference and implementation scope

The user explicitly chose the VSSS reference linked by the [official LARC 2026 organizer page](https://mecatronica.umng.edu.co/index.html/larc.html). That page links [LARC-VSSS-2025-PR.pdf](https://mecatronica.umng.edu.co/index.html/rules/LARC-VSSS-2025-PR.pdf), whose cover says **VSSS Série A, 2023**. The file was read, and its field, marker and restart figures were inspected. The project records this discrepancy; it does not invent a revised 2026 rulebook or claim competition homologation. The organizer's complete reference and later official amendments take precedence.

`CONFIG` selects `vsss-larc-reference`. `USER_CONFIG` separately preserves the earlier requested 1.50 × 1.20 m training field, 600 s interval, one 120 s timeout, instantaneous wheel-speed response and manual-only referee. Editing dimensions in the interface marks a configuration as custom.

## Reference dimensions and timing

The default is a 1.50 × 1.30 m black playing surface, 0.40 × 0.10 m goals, 70 mm corner chamfers and 0.20 m center-circle radius. Goal areas combine a rectangle and a half ellipse. Bare robot side is limited to 75 mm; the reference permits an 80 mm uniform envelope. The default body is 75 × 75 × 65 mm, with 65 mm axle separation and 32 mm wheel diameter. The camera starts 2 m above midfield. Match timing uses two 300 s halves, 480 s interval and two technical timeouts of up to 180 s per team. These are summarized from the selected reference's field, robot, game-time and vision provisions.

All world lengths use meters. The schema checks bounds, fitting goal/area geometry, wheel track including 6 mm tire thickness, wheel diameter versus body height and the bare-robot size limit. These numerical checks do not replace physical inspection. Roof markers follow the metric patch layout in the reference appendix; displayed RGB values are uncalibrated.

## Referee model

The engine distinguishes participation from mere occupancy. It tracks area entry duration for dynamic keeper/first-attacker selection. A participating second defender with the ball in its own area leads to a penalty; a participating second attacker in the opposing area leads to a goal kick. Forced defensive entry is exempt until exit. Sustained pushing without an intervening ball, uncontested keeper possession and contested stagnation also have automatic decisions. A same-tick goal takes priority. Manual decisions cover handling and other judgment-based incidents.

Restart types are kickoff, penalty, free kick, goal kick and neutral free ball. A stopped setup freezes playing time and motors; the whistle releases all active robots. False-start warnings and restart-specific escalation include a defending penalty keeper caution and temporary exclusion for 30 playing seconds or an opponent goal. The [referee article](articles/referee-and-restarts.md) contains a step-by-step exercise and implementation details.

## Explicit approximations

- Pushing duration (default 0.3 s), relative-speed thresholds, participation/contact radius and stagnation tolerances are simulator heuristics, not official numerical limits.
- Contacts use circumscribed circles; area participation uses rotated square envelopes. No mass/inertia, measured motor torque, traction, body tipping or gripping mechanism is modeled.
- A virtual referee places stopped formations immediately. The physical eight-second autonomous-positioning challenge, human advantage review and event-specific referee-box protocol are not implemented.
- False starts are observed manually because this engine prevents pre-whistle motion. Card handling covers the implemented restart scenario, without a general tournament disciplinary system.
- Early timeout termination, substitutions, shootouts, walkovers, real camera detection and physical hardware inspection remain future work.

Read [the didactic articles](articles/first-match.md), run the synthetic rule fixtures and consult the organizer before an event. Software tests verify modeled behavior only.
