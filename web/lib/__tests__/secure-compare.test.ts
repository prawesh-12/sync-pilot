import { describe, expect, it } from "vitest";
import { secureEquals } from "@/lib/secure-compare";

describe("secureEquals", () => {
  it("returns true for identical strings", () => {
    expect(secureEquals("Bearer abc123", "Bearer abc123")).toBe(true);
  });

  it("returns false for different same-length strings", () => {
    expect(secureEquals("Bearer abc123", "Bearer abc124")).toBe(false);
  });

  it("returns false for different-length strings", () => {
    expect(secureEquals("short", "much-longer-secret")).toBe(false);
  });

  it("returns false when either side is empty", () => {
    expect(secureEquals("", "secret")).toBe(false);
    expect(secureEquals("secret", "")).toBe(false);
  });

  it("handles multi-byte/unicode input without throwing", () => {
    expect(secureEquals("café-\u{1F510}", "café-\u{1F510}")).toBe(true);
    expect(secureEquals("café-\u{1F510}", "latte-\u{1F511}")).toBe(false);
  });
});
