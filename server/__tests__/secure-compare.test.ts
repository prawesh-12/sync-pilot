import { describe, expect, it } from "vitest";
import { secureEquals } from "../secure-compare";

describe("secureEquals (server)", () => {
  it("returns true for matching string header and secret", () => {
    expect(secureEquals("the-secret", "the-secret")).toBe(true);
  });

  it("returns false for a mismatched secret", () => {
    expect(secureEquals("nope", "the-secret")).toBe(false);
  });

  it("returns false for an array header (duplicated header)", () => {
    expect(secureEquals(["the-secret"], "the-secret")).toBe(false);
  });

  it("returns false when the header is undefined", () => {
    expect(secureEquals(undefined, "the-secret")).toBe(false);
  });

  it("returns false when the expected secret is empty", () => {
    expect(secureEquals("", "")).toBe(false);
  });
});
