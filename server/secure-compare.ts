import { timingSafeEqual } from "node:crypto";

// Constant-time comparison for the shared SYNC_SECRET, so the /sync token can't
// be brute-forced byte-by-byte via response-timing differences. The header value
// may be a string, string[], or undefined depending on Express parsing.
export function secureEquals(
  provided: string | string[] | undefined,
  expected: string,
): boolean {
  if (typeof provided !== "string" || !expected) {
    return false;
  }

  const providedBuffer = Buffer.from(provided, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}
