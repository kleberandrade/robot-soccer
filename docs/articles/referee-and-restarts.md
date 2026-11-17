# Fouls, penalties, and the referee whistle

This article is a guide to the implemented simulator, not a substitute for the organizer's complete rulebook. The user selected the PDF linked by the [official LARC 2026 organizer](https://mecatronica.umng.edu.co/index.html/larc.html). The linked file is named `LARC-VSSS-2025-PR.pdf`, while its cover identifies VSSS Série A, 2023. The application records that distinction instead of guessing an unpublished edition.

## The important distinction: contact is not always a foul

A robot collision can be incidental. The virtual official looks for sustained pushing without an intervening ball; it does not punish every touch. Its contact-duration and speed thresholds are simulation heuristics, not numerical limits quoted from the rulebook. A human official can make a manual decision or use manual-only mode when judgment is needed.

## What the selected reference says

The linked reference distinguishes personal, attacking and defending infractions. A participating second attacker in the opposing goal area leads to a goal kick; a participating second defender with the ball in its own area can lead to a penalty, with goal advantage. Merely occupying the area is insufficient, and being pushed in is an exception. Uncontested goalkeeper possession is limited to ten seconds. A stalemate can require a neutral free ball or a goal-area restart. Repeated false starts escalate beyond an initial warning. On an in-game penalty, the taker is behind the mark, the keeper touches its goal line, and the others begin in the opposite half; all may move after the whistle. These are references to sections 9–15, not a complete reproduction of the rules.

## Run your first penalty

In the match lab:

1. Start a local preview. No database or token is needed for this experiment.
2. Open **Make a referee decision**.
3. Choose **Second defender involved → penalty**, with **Yellow** as the offending team.
4. Apply the decision. The clock and motors stop. Blue receives the penalty.
5. Inspect the setup in both views. On the default field, the mark is 0.375 m from center. The other four robots are across midfield; the defending keeper's side touches the goal line.
6. Press **Whistle / resume**. The robots act autonomously again. The penalty is not an automatic goal or a prerecorded shot.

The manual call lets an official declare an infraction. It does not give the operator a way to steer the taker. Different team logic can produce a goal, a save, a miss, or a later stoppage.

## Automatic observations used by this model

The virtual official can observe metric poses, contact and the ball directly. It implements:

- A second **participating** defender in the own goal area while the ball is there: penalty to the opponent.
- A second participating attacker in the opposing goal area: goal kick for the defending team.
- Sustained opponent pushing without the ball between them: a personal-foul restart. Pushing the keeper in its own area yields a goal kick.
- Ten seconds of uncontested keeper contact/possession: penalty. An opponent challenging the ball resets the possession counter.
- Ten seconds of contested stagnation: a neutral free ball outside goal areas, or a goal kick inside an area.

The goal area includes its rectangular portion and the elliptical extension. Robot occupancy tests the rotated square envelope, not only the center point. Pushed-in entries are tracked until the robot exits the area. A goal computed on the same tick takes priority over a defensive penalty.

The simulator has no gripping mechanism, body tipping or human interference sensor. Handling and judgment-based incidents can be called manually; their physical occurrence is not fabricated by the automatic detector. It does not predict a future scoring chance or implement a complete human advantage/review process.

## Understand the restart state

A restart has a type, awarded team or neutral status, a ball mark, selected taker/keeper, warning counts, and a stage. In `setup`, the state is `stoppage`: the match clock is frozen. The virtual referee places the models into a deterministic legal formation. This explicit reset is not a demonstration of the rulebook's physical eight-second autonomous-positioning challenge.

The whistle changes the stage to `live`. All active robots may move. Once the ball leaves the start mark, the temporary restart target is cleared and ordinary tactics continue. A goal creates a new kickoff waiting for another whistle.

The fast terminal runner acknowledges each stoppage automatically so it can finish an entire match. In the web lab, the human official controls the whistle.

## Warnings, cards, and exclusions

A first false start repositions the current setup and records a warning. Further calls follow the restart-specific escalation: possession changes/free kicks, a lost attacking penalty becoming a free ball, or a defending penalty keeper caution followed by temporary exclusion. Excluded robots do not move or collide. Playing time or the opponent's goal can permit a return; a paused clock does not consume the exclusion period.

False starts are manual observations here because the simulation itself refuses wheel motion before the whistle. There are no hidden moving robots during a stopped state.

## Read the event history

The referee panel shows the recent calls, playing timestamp, benefiting side and restart. The authoritative state retains a bounded recent event list plus cumulative event and foul counters. Persistent server replay chunks retain the full checkpoint at each revision, so these decisions survive a page reload without a per-tick SQL write.

## Test it yourself

```sh
npm test --workspace=@robot-soccer/engine
```

Look at `tests/referee.test.ts` inside the engine package. The fixtures place robots explicitly to test participation, incidental occupancy, the ten-second timers, geometry, mirrored penalties, warnings, and checkpoint compatibility. Those are synthetic rule scenarios, not physical validation or a claim of full tournament certification.

Continue with [Camera and markers](/docs/camera-and-markers) to relate those positions to the two simultaneous views.
