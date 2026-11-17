import { it, expect } from "vitest";
import {
  accessKey,
  secretHash,
  invitation,
  normalizeInvitation,
  roleFor,
} from "../src/room-auth";
it("uses independent strong credentials and stores/verifies their hashes", () => {
  const host = accessKey(),
    blue = accessKey(),
    yellow = accessKey();
  expect(host).toHaveLength(43);
  expect(host).not.toBe(blue);
  const hashes = {
    host: secretHash(host),
    spectator: null,
    blue: secretHash(blue),
    yellow: secretHash(yellow),
  };
  expect(roleFor(host, hashes)).toBe("host");
  expect(roleFor(blue, hashes)).toBe("blue");
  expect(roleFor(yellow, hashes)).toBe("yellow");
  expect(roleFor(accessKey(), hashes)).toBeNull();
  expect(roleFor("é".repeat(43), hashes)).toBeNull();
  expect(hashes.host).not.toBe(host);
});
it("uses separate, normalizable private invitation codes", () => {
  const code = invitation();
  expect(code).toMatch(/^[A-HJ-NP-Z2-9]{16}$/);
  expect(
    normalizeInvitation(
      code
        .match(/.{1,4}/g)!
        .join("-")
        .toLowerCase(),
    ),
  ).toBe(code);
  expect(invitation()).not.toBe(code);
});
