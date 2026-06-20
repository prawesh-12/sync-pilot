import { describe, expect, it } from "vitest";
import { sanitizeLabel, sanitizeReturnTo } from "@/lib/utils";

describe("sanitizeReturnTo", () => {
  it("keeps same-origin relative paths", () => {
    expect(sanitizeReturnTo("/settings")).toBe("/settings");
  });

  it("rejects protocol-relative URLs (open redirect)", () => {
    expect(sanitizeReturnTo("//evil.com")).toBe("/dashboard");
  });

  it("rejects absolute URLs", () => {
    expect(sanitizeReturnTo("https://evil.com")).toBe("/dashboard");
  });

  it("falls back for non-string or empty input", () => {
    expect(sanitizeReturnTo(null)).toBe("/dashboard");
    expect(sanitizeReturnTo(undefined)).toBe("/dashboard");
    expect(sanitizeReturnTo("relative/no-slash")).toBe("/dashboard");
  });

  it("honors a custom fallback", () => {
    expect(sanitizeReturnTo("//evil.com", "/home")).toBe("/home");
  });
});

describe("sanitizeLabel", () => {
  it("trims surrounding whitespace", () => {
    expect(sanitizeLabel("  Work  ")).toBe("Work");
  });

  it("caps length at 40 characters", () => {
    expect(sanitizeLabel("x".repeat(50))).toHaveLength(40);
  });

  it("returns empty string for non-string input", () => {
    expect(sanitizeLabel(null)).toBe("");
    expect(sanitizeLabel(undefined)).toBe("");
  });
});
