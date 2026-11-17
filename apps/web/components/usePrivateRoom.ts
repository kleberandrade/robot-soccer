"use client";
import { useState, useEffect } from "react";
import type {
  PublicRoom,
  RoomConnection,
  RoomInvitations,
} from "../src/room-client-types";
import { PrivateRoomSession } from "../src/room-session";
export function usePrivateRoom() {
  const [room, setRoom] = useState<PublicRoom | null>(null),
    [connection, setConnection] = useState<RoomConnection | null>(null),
    [invitations, setInvitations] = useState<RoomInvitations | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const [session] = useState(
    () =>
      new PrivateRoomSession({
        room: setRoom,
        connection: setConnection,
        invitations: setInvitations,
        message: setMessage,
        busy: setBusy,
      }),
  );
  useEffect(() => {
    session.resume();
    const timer = setInterval(() => void session.poll(), 1000);
    return () => {
      clearInterval(timer);
      session.close();
    };
  }, [session]);
  return {
    room,
    connection,
    invitations,
    message,
    busy,
    connect: (next: RoomConnection) => session.connect(next),
    create: (name: string, operator: string) => session.create(name, operator),
    join: (code: string, name: string) => session.join(code, name),
    act: (action: string, extra: object = {}) => session.action(action, extra),
  };
}
export function connectionSettings(connection: RoomConnection) {
  return `BASE_URL=${window.location.origin}\nROOM_ID=${connection.id}\nROOM_KEY=${connection.key}\n`;
}
export function downloadConnection(connection: RoomConnection, role: string) {
  const blob = new Blob([connectionSettings(connection)], {
      type: "text/plain",
    }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `.env.room-${role}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
