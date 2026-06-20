import { timingSafeEqual } from "node:crypto";

// Constant-time string comparison for secrets (cron/sync tokens), so an attacker
// can't brute-force a secret byte-by-byte via response-timing differences. A
// plain `a === b` short-circuits on the first mismatched byte and leaks length.
export function secureEquals(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, "utf8");
  const bBuffer = Buffer.from(b, "utf8");

  // timingSafeEqual throws on length mismatch; comparing lengths first only
  // leaks the secret's length, not its contents.
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}
