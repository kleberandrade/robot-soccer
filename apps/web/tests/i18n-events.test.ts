import { describe, expect, it } from "vitest";
import type { RefereeEvent } from "@robot-soccer/engine";
import { eventMessage, eventLabel, restartLabel } from "../i18n/events";
import { message, translate } from "../i18n/catalog";
const event = (
  kind: string,
  text: string,
  team: "blue" | "yellow" | null = "blue",
): RefereeEvent => ({
  id: 1,
  tick: 60,
  matchTick: 60,
  kind,
  team,
  restart: "penalty",
  source: "referee",
  message: text,
});
describe("localized dynamic referee and connection messages", () => {
  it("keeps protocol records original while rendering team-dependent goals", () => {
    const input = event(
      "goal",
      "Goal for blue. Kickoff for yellow awaits the whistle.",
    );
    expect(eventMessage("pt-BR", input)).toBe(
      "Gol do time azul. Saída do time amarelo aguarda o apito.",
    );
    expect(eventMessage("es", input)).toContain("equipo amarillo");
    expect(eventMessage("en", input)).toBe(input.message);
    expect(input.message).toBe(
      "Goal for blue. Kickoff for yellow awaits the whistle.",
    );
  });
  it("preserves robot IDs and warning counts in translated prose", () => {
    expect(
      eventMessage("pt-BR", event("warning", "False start: blue, warning 3.")),
    ).toContain("advertência 3");
    expect(
      eventMessage(
        "es",
        event(
          "exclusion",
          "blue-0 excluded for 30 seconds of playing time or until the opponent scores.",
        ),
      ),
    ).toBe(
      "blue-0 excluido durante 30 segundos de juego o hasta que marque el rival.",
    );
    expect(
      eventMessage("pt-BR", event("return", "yellow-2 may return to play.")),
    ).toBe("yellow-2 pode retornar ao jogo.");
  });
  it("translates whistle, cautions and neutral or team restarts", () => {
    expect(
      eventMessage(
        "es",
        event("whistle", "Whistle: all active robots may move autonomously."),
      ),
    ).toMatch(/^Silbato:/);
    expect(
      eventMessage(
        "pt-BR",
        event(
          "yellow-card",
          "Defending goalkeeper cautioned for repeated false start.",
        ),
      ),
    ).toMatch(/^Goleiro/);
    expect(
      eventMessage(
        "pt-BR",
        event(
          "defensive-overload",
          "defensive overload: penalty for yellow.",
          "blue",
        ),
      ),
    ).toBe("Segundo defensor envolvido: Pênalti para o time amarelo.");
    expect(
      eventMessage("es", {
        ...event("free-ball", "free ball: free ball.", "blue"),
        restart: "free-ball",
      }),
    ).not.toContain("equipo");
  });
  it("uses localized labels for events and dynamic server IDs", () => {
    expect(eventLabel("pt-BR", "goal-area-stalemate")).toBe(
      "Impasse na área do gol",
    );
    expect(restartLabel("es", "goal-kick")).toBe("Saque de meta");
    expect(eventLabel("es", "future-event")).toBe("Evento arbitral");
    expect(translate("pt-BR", "Server match connected · abc123")).toBe(
      "Partida no servidor conectada · abc123",
    );
    expect(message("es", "{missing}", {})).toBe("{missing}");
    expect(translate("pt-BR", "signal timed out")).toBe(
      "A solicitação excedeu o tempo limite.",
    );
  });
});
