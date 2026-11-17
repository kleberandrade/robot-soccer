import { it, expect, vi, afterEach } from "vitest";
vi.mock("@robot-soccer/database", () => ({ query: vi.fn() }));
import { query } from "@robot-soccer/database";
import {
  loadRoom,
  authorizeRoom,
  publicRoom,
  type StoredRoom,
} from "../src/room-store";
import { newRoomState } from "../src/room-domain";
import { secretHash } from "../src/room-auth";
const keys = {
  host: "A".repeat(43),
  spectator: "B".repeat(43),
  blue: "C".repeat(43),
  yellow: "D".repeat(43),
};
function fixture(): StoredRoom {
  return {
    id: "01111111-1111-4111-8111-111111111111",
    revision: 0,
    state: newRoomState("Private fixture"),
    host_hash: secretHash(keys.host),
    spectator_hash: secretHash(keys.spectator),
    blue_invite_hash: secretHash("BLUEINVITATIONFIX"),
    yellow_invite_hash: secretHash("YELLOWINVITEFIXT"),
    blue_key_hash: secretHash(keys.blue),
    yellow_key_hash: secretHash(keys.yellow),
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  };
}
afterEach(() => vi.clearAllMocks());
it("returns each credential only its own role and denies missing or wrong keys", () => {
  const row = fixture();
  for (const [role, key] of Object.entries(keys)) {
    expect(
      authorizeRoom(
        row,
        new Request("http://local", {
          headers: { Authorization: `Bearer ${key}` },
        }),
      ),
    ).toBe(role);
  }
  expect(() => authorizeRoom(row, new Request("http://local"))).toThrow();
  expect(() =>
    authorizeRoom(
      row,
      new Request("http://local", {
        headers: { Authorization: "Bearer " + "Z".repeat(43) },
      }),
    ),
  ).toThrow();
});
it("never exposes invitation hashes, keys or queued opponent commands in a room observation", () => {
  const row = fixture();
  row.state.pending.blue = [{ id: "blue-0", left: 0.3, right: 0.3 }];
  const result = publicRoom(row, "yellow"),
    serialized = JSON.stringify(result);
  expect(result.waitingFor).toEqual(["yellow"]);
  expect(serialized).not.toContain("host_hash");
  expect(serialized).not.toContain(row.blue_invite_hash);
  expect(serialized).not.toContain("pending");
  expect(serialized).not.toContain(keys.host);
});
it("refuses expired rooms and unknown IDs before returning an observation", async () => {
  const row = fixture();
  row.expires_at = "2020-01-01T00:00:00Z";
  vi.mocked(query).mockResolvedValueOnce([row]);
  await expect(loadRoom(row.id)).rejects.toMatchObject({ status: 404 });
  vi.mocked(query).mockResolvedValueOnce([]);
  await expect(loadRoom(row.id)).rejects.toMatchObject({ status: 404 });
});
