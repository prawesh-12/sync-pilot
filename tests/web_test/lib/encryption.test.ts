import { afterEach, describe, expect, it, vi } from "vitest";
import { decrypt, encrypt } from "@/lib/encryption";

// 32 bytes of hex: the only shape getEncryptionKeyBuffer accepts.
const KEY = "a".repeat(64);
const OTHER_KEY = "b".repeat(64);

function useKey(value: string) {
  vi.stubEnv("ENCRYPTION_KEY", value);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("encrypt and decrypt", () => {
  it("round-trips a value", () => {
    useKey(KEY);
    expect(decrypt(encrypt("gmail-refresh-token"))).toBe("gmail-refresh-token");
  });

  it("round-trips an empty string", () => {
    useKey(KEY);
    expect(decrypt(encrypt(""))).toBe("");
  });

  it("round-trips non-ASCII text", () => {
    useKey(KEY);
    expect(decrypt(encrypt("café ☕ 東京"))).toBe("café ☕ 東京");
  });

  it("produces a different ciphertext each time for the same input", () => {
    useKey(KEY);
    expect(encrypt("same-value")).not.toBe(encrypt("same-value"));
  });

  it("emits three base64 parts: iv, auth tag, ciphertext", () => {
    useKey(KEY);
    const parts = encrypt("value").split(":");

    expect(parts).toHaveLength(3);
    expect(Buffer.from(parts[0], "base64")).toHaveLength(16);
    expect(Buffer.from(parts[1], "base64")).toHaveLength(16);
  });
});

describe("decrypt rejects tampering", () => {
  it("refuses a ciphertext encrypted under a different key", () => {
    useKey(KEY);
    const ciphertext = encrypt("secret");

    useKey(OTHER_KEY);
    expect(() => decrypt(ciphertext)).toThrow();
  });

  it("refuses a modified ciphertext body", () => {
    useKey(KEY);
    const [iv, tag, body] = encrypt("secret").split(":");
    const flipped = Buffer.from(body, "base64");
    flipped[0] ^= 0xff;

    expect(() =>
      decrypt([iv, tag, flipped.toString("base64")].join(":")),
    ).toThrow();
  });

  it("refuses a modified authentication tag", () => {
    useKey(KEY);
    const [iv, tag, body] = encrypt("secret").split(":");
    const flipped = Buffer.from(tag, "base64");
    flipped[0] ^= 0xff;

    expect(() =>
      decrypt([iv, flipped.toString("base64"), body].join(":")),
    ).toThrow();
  });
});

describe("decrypt rejects malformed payloads", () => {
  it("refuses a payload without three parts", () => {
    useKey(KEY);
    expect(() => decrypt("only:two")).toThrow("Encrypted payload is malformed.");
  });

  it("refuses a payload with an empty part", () => {
    useKey(KEY);
    expect(() => decrypt("::")).toThrow(
      "Encrypted payload is missing the initialization vector.",
    );
  });

  it("refuses an initialization vector of the wrong length", () => {
    useKey(KEY);
    const [, tag, body] = encrypt("secret").split(":");
    const shortIv = Buffer.alloc(8).toString("base64");

    expect(() => decrypt([shortIv, tag, body].join(":"))).toThrow(
      "Encrypted payload has an invalid initialization vector.",
    );
  });

  it("refuses an authentication tag of the wrong length", () => {
    useKey(KEY);
    const [iv, , body] = encrypt("secret").split(":");
    const shortTag = Buffer.alloc(8).toString("base64");

    expect(() => decrypt([iv, shortTag, body].join(":"))).toThrow(
      "Encrypted payload has an invalid authentication tag.",
    );
  });
});

describe("encryption key validation", () => {
  it("rejects a key that is not 64 characters", () => {
    useKey("abc");
    expect(() => encrypt("value")).toThrow(
      "ENCRYPTION_KEY must be a 64-character hex string.",
    );
  });

  it("rejects a 64-character key that is not hex", () => {
    useKey("z".repeat(64));
    expect(() => encrypt("value")).toThrow(
      "ENCRYPTION_KEY must only contain hexadecimal characters.",
    );
  });

  it("rejects a missing key", () => {
    useKey("");
    expect(() => encrypt("value")).toThrow(
      "ENCRYPTION_KEY must be a 64-character hex string.",
    );
  });
});
