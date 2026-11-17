"use client";
import { useEffect, useState } from "react";
import { CONFIG, createMatch, type Match } from "@robot-soccer/engine";
import type { MatchRow } from "@robot-soccer/database";
import { MatchSession, type Strategies } from "../src/session";
export function useMatchLab() {
  const [shown, setShown] = useState<Match>(() => createMatch()),
    [row, setRow] = useState<MatchRow | null>(null),
    [busy, setBusy] = useState(false);
  const [token, setToken] = useState(""),
    [message, setMessage] = useState(
      "Local preview. Connect a dedicated database to save server matches.",
    );
  const [trail, setTrail] = useState<[number, number][]>([]),
    [trails, setTrails] = useState(true),
    [plan, setPlan] = useState(false);
  const [config, setConfig] = useState({ ...CONFIG }),
    [strategies, setStrategies] = useState<Strategies>({
      blue: "balanced",
      yellow: "press",
    }),
    [matchId, setMatchId] = useState("");
  const [session] = useState(
    () =>
      new MatchSession({
        show: setShown,
        row: setRow,
        message: setMessage,
        busy: setBusy,
        resetTrail: () => setTrail([]),
      }),
  );
  useEffect(() => {
    session.token = token;
  }, [session, token]);
  useEffect(() => {
    session.resume();
    const timer = setInterval(() => void session.tick(), 100);
    return () => {
      clearInterval(timer);
      session.close();
    };
  }, [session]);
  useEffect(() => {
    if (trails)
      setTrail((t) => [...t.slice(-100), [shown.ball.x, shown.ball.y]]);
  }, [shown.tick, shown.ball.x, shown.ball.y, trails]);
  useEffect(() => {
    if (row) setMatchId(row.id);
  }, [row]);
  return {
    shown,
    row,
    busy,
    token,
    setToken,
    message,
    trail,
    trails,
    setTrails,
    plan,
    setPlan,
    config,
    setConfig,
    strategies,
    setStrategies,
    matchId,
    setMatchId,
    action: (action: Parameters<MatchSession["action"]>[0]) =>
      session.action(action),
    connect: (load = false) =>
      session.connect(config, strategies, load ? matchId : undefined),
    preview: () => session.preview(config, strategies),
  };
}
export type Lab = ReturnType<typeof useMatchLab>;
