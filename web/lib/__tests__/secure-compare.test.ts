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

  it("handles unicode without throwing", () => {
    expect(secureEquals("cle", "cle")).toBe(true);
    expect(secureEquals("cle", "cle")).toBe(false);
  });
});
