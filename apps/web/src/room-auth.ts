import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
export type RoomRole = "host" | "spectator" | "blue" | "yellow";
export const secretHash = (key: string) =>
  createHash("sha256").update(key).digest("hex");
export const accessKey = () => randomBytes(32).toString("base64url");
export function invitation() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(16), (n) => alphabet[n % alphabet.length]).join(
    "",
  );
}
export const normalizeInvitation = (code: string) =>
  code.replaceAll("-", "").replaceAll(" ", "").toUpperCase();
export function equalHash(actual: string, expected: string | null) {
  if (!expected) return false;
  const a = Buffer.from(actual, "hex"),
    b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
export function roleFor(
  key: string,
  hashes: Record<RoomRole, string | null>,
): RoomRole | null {
  if (!/^[a-zA-Z0-9_-]{43}$/.test(key)) return null;
  const actual = secretHash(key);
  return (
    (["host", "spectator", "blue", "yellow"] as RoomRole[]).find((role) =>
      equalHash(actual, hashes[role]),
    ) ?? null
  );
}
export function bearerKey(request: Request) {
  return request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
}
