"use client";

import { T } from "../i18n/client";

import { LocalLink as Link } from "../i18n/client";
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
            <span className="section-kicker">
              <T>{"PRIVATE REMOTE COMPETITIONS"}</T>
            </span>
            <h1>
              <T>{"Your code."}</T>
              <br />
              <T>{"A shared playing field."}</T>
            </h1>
            <p>
              <T>
                {
                  "Run a team on your computer. Invite an opponent anywhere. Let the server keep the official match."
                }
              </T>
            </p>
          </header>
          <div className="competition-start">
            <RoomEntry lab={lab} />
            <aside>
              <span className="section-kicker">
                <T>{"HOW IT WORKS"}</T>
              </span>
              <ol>
                <li>
                  <strong>
                    <T>{"A host creates a room."}</T>
                  </strong>
                  <p>
                    <T>{"Each team receives a separate private invitation."}</T>
                  </p>
                </li>
                <li>
                  <strong>
                    <T>{"Connect your own code."}</T>
                  </strong>
                  <p>
                    <T>
                      {
                        "Claim your team and save its connection. Programs run on participant computers."
                      }
                    </T>
                  </p>
                </li>
                <li>
                  <strong>
                    <T>{"Play the same turn."}</T>
                  </strong>
                  <p>
                    <T>
                      {
                        "The server advances after both teams submit, so network speed grants no extra turns."
                      }
                    </T>
                  </p>
                </li>
              </ol>
              <Link href="/docs/remote-competition">
                <T>{"Read the connection guide"}</T>
              </Link>
            </aside>
          </div>
        </>
      ) : (
        <RoomDashboard lab={lab} />
      )}
      <p className="room-message" role="status">
        <T>{lab.message}</T>
      </p>
    </>
  );
}
