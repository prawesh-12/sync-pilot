import { afterEach, describe, expect, it, vi } from "vitest";
import { getSignalAuthHeaders, SIGNAL_AUTH_HEADER } from "@/config/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSignalAuthHeaders", () => {
  it("returns the auth header when SIGNAL_AUTH_TOKEN is set", () => {
    vi.stubEnv("SIGNAL_AUTH_TOKEN", "s3cr3t");
    expect(getSignalAuthHeaders()).toEqual({ [SIGNAL_AUTH_HEADER]: "s3cr3t" });
  });

  it("returns no header when SIGNAL_AUTH_TOKEN is empty", () => {
    vi.stubEnv("SIGNAL_AUTH_TOKEN", "");
    expect(getSignalAuthHeaders()).toEqual({});
  });
});
