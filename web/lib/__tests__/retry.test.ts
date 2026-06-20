import { describe, expect, it, vi } from "vitest";
import { withTimeoutAndRetry } from "@/lib/retry";

const opts = { timeoutMs: 50, retries: 2, label: "test", backoffMs: 1 };

describe("withTimeoutAndRetry", () => {
  it("returns the result on first success", async () => {
    const run = vi.fn().mockResolvedValue("ok");

    await expect(withTimeoutAndRetry(run, opts)).resolves.toBe("ok");
    expect(run).toHaveBeenCalledOnce();
  });

  it("retries after a failure and then succeeds", async () => {
    const run = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValue("ok");

    await expect(withTimeoutAndRetry(run, opts)).resolves.toBe("ok");
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("throws the last error after exhausting retries", async () => {
    const run = vi.fn().mockRejectedValue(new Error("always"));

    await expect(withTimeoutAndRetry(run, opts)).rejects.toThrow("always");
    // first attempt + 2 retries
    expect(run).toHaveBeenCalledTimes(3);
  });

  it("times out a hanging call", async () => {
    const run = () => new Promise<string>(() => {});

    await expect(
      withTimeoutAndRetry(run, { timeoutMs: 20, retries: 0, label: "hang", backoffMs: 1 }),
    ).rejects.toThrow(/timed out/);
  });
});
