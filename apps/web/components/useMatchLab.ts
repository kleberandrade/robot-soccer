"use client";
import { useEffect, useState } from "react";
import {
  CONFIG,
  createMatch,
  type Match,
  type Config,
  type Decision,
} from "@robot-soccer/engine";
import {
  DEFAULT_CAMERA,
  CameraSchema,
  type CameraConfig,
} from "@robot-soccer/engine/camera";
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
    [trails, setTrails] = useState(true);
  const [camera, setCameraState] = useState<CameraConfig>({
      ...DEFAULT_CAMERA,
    }),
    [rig, setRig] = useState(false);
  const [config, setConfig] = useState<Config>({ ...CONFIG }),
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
    camera,
    rig,
    setRig,
    setCamera: (next: CameraConfig) => {
      const result = CameraSchema.safeParse(next);
      if (result.success) setCameraState(result.data);
    },
    decide: (decision: Decision) => session.decide(decision),
    row,
    busy,
    token,
    setToken,
    message,
    trail,
    trails,
    setTrails,
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
