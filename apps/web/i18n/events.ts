import type { RefereeEvent } from "@robot-soccer/engine";
import type { Locale } from "./config";
import { translate, message } from "./catalog";
const labels: Record<string, string> = {
  "personal-foul": "Illegal contact / pushing",
  handling: "Illegal ball retention",
  "attacking-overload": "Second attacker involved",
  "defensive-overload": "Second defender involved",
  "keeper-retention": "Keeper possession exceeds 10 s",
  "goalkeeper-block": "Blocking the goalkeeper",
  "goalkeeper-push": "Pushing keeper without the ball",
  "goal-area-stalemate": "Goal-area stalemate",
  "false-start": "False start",
  "free-ball": "Neutral free ball",
  whistle: "Whistle",
  exclusion: "Temporary exclusion",
  "yellow-card": "Yellow card",
  warning: "Warning",
  return: "Return to play",
  goal: "Goal",
};
const restarts: Record<string, string> = {
  kickoff: "Kickoff",
  penalty: "Penalty",
  "free-kick": "Free kick",
  "goal-kick": "Goal kick",
  "free-ball": "Free ball",
};
export function eventLabel(locale: Locale, kind: string) {
  return translate(locale, labels[kind] ?? "Referee event");
}
export function restartLabel(locale: Locale, kind: string) {
  return translate(locale, restarts[kind] ?? "Restart");
}
function teamName(locale: Locale, event: RefereeEvent) {
  return translate(locale, event.team ?? "Neutral ball");
}
function robotName(locale: Locale, event: RefereeEvent) {
  return (
    event.message.match(/\b(?:blue|yellow)-[0-2]\b/)?.[0] ??
    translate(locale, "Robot")
  );
}
const renderers: Record<
  string,
  (locale: Locale, event: RefereeEvent) => string
> = {
  goal: (locale, event) =>
    message(
      locale,
      "Goal for {team}. Kickoff for {opponent} awaits the whistle.",
      {
        team: teamName(locale, event),
        opponent: translate(locale, event.team === "blue" ? "yellow" : "blue"),
      },
    ),
  whistle: (locale) =>
    translate(locale, "Whistle: all active robots may move autonomously."),
  warning: (locale, event) =>
    message(locale, "False start: {team}, warning {count}.", {
      team: teamName(locale, event),
      count: event.message.match(/warning (\d+)/)?.[1] ?? "?",
    }),
  exclusion: (locale, event) =>
    message(
      locale,
      "{robot} excluded for 30 seconds of playing time or until the opponent scores.",
      { robot: robotName(locale, event) },
    ),
  return: (locale, event) =>
    message(locale, "{robot} may return to play.", {
      robot: robotName(locale, event),
    }),
  "yellow-card": (locale) =>
    translate(
      locale,
      "Defending goalkeeper cautioned for repeated false start.",
    ),
};
export function eventMessage(locale: Locale, event: RefereeEvent) {
  if (locale === "en") return event.message;
  const renderer = renderers[event.kind];
  if (renderer) return renderer(locale, event);
  // event.team identifies the offender; the canonical message names the restart beneficiary.
  const awardedTeam = event.message.match(/ for (blue|yellow)\.$/)?.[1];
  return message(locale, "{decision}: {restart}{team}.", {
    decision: eventLabel(locale, event.kind),
    restart: restartLabel(locale, event.restart ?? ""),
    team: awardedTeam
      ? message(locale, " for {team}", { team: translate(locale, awardedTeam) })
      : "",
  });
}
