"use client";
import Link from "next/link";
import RoomEntry from "./RoomEntry";
import RoomDashboard from "./RoomDashboard";
import { usePrivateRoom } from "./usePrivateRoom";
export default function Competition() {
  const lab = usePrivateRoom();
  return (
    <>
      {!lab.room ? (
        <>
          <header className="competition-intro">
            <span className="section-kicker">PRIVATE REMOTE COMPETITIONS</span>
            <h1>
              Your code.
              <br />A shared playing field.
            </h1>
            <p>
              Run a team on your computer. Invite an opponent anywhere. Let the
              server keep the official match.
            </p>
          </header>
          <div className="competition-start">
            <RoomEntry lab={lab} />
            <aside>
              <span className="section-kicker">HOW IT WORKS</span>
              <ol>
                <li>
                  <strong>A host creates a room.</strong>
                  <p>Each team receives a separate private invitation.</p>
                </li>
                <li>
                  <strong>Connect your own code.</strong>
                  <p>
                    Claim your team and save its connection. Programs run on
                    participant computers.
                  </p>
                </li>
                <li>
                  <strong>Play the same turn.</strong>
                  <p>
                    The server advances after both teams submit, so network
                    speed grants no extra turns.
                  </p>
                </li>
              </ol>
              <Link href="/docs/remote-competition">
                Read the connection guide
              </Link>
            </aside>
          </div>
        </>
      ) : (
        <RoomDashboard lab={lab} />
      )}
      <p className="room-message" role="status">
        {lab.message}
      </p>
    </>
  );
}
