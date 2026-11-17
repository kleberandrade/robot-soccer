import type { Match, Team } from "@robot-soccer/engine";
import type { Participant } from "./room-domain";
export type PublicRoom = {
  id: string;
  revision: number;
  expiresAt: string;
  name: string;
  turn: number;
  match: Match;
  participants: Record<Team, Participant | null>;
  waitingFor: Team[];
  role: "host" | "spectator" | Team;
};
export type RoomConnection = { id: string; key: string };
export type RoomInvitations = {
  blue: string;
  yellow: string;
  spectatorKey: string;
};
