import { afterEach, describe, expect, it, vi } from "vitest";

// config.ts reads process.env at import time, so each case re-imports it with a
// fresh module registry. dotenv is stubbed out so a developer's local .env file
// cannot change the result.
vi.mock("dotenv", () => ({ config: () => ({ parsed: {} }) }));

// Every variable config.ts reads. Each case starts from all of them cleared, so
// a developer's local .env cannot make a test pass or fail.
const CONFIG_KEYS = [
  "SYNC_SECRET",
  "REDIS_HOST",
  "REDIS_PORT",
  "PORT",
  "WEB_APP_URL",
  "QUEUE_DASHBOARD_USER",
  "QUEUE_DASHBOARD_PASSWORD",
] as const;

async function loadConfig(env: Partial<Record<(typeof CONFIG_KEYS)[number], string>>) {
  vi.resetModules();

  for (const key of CONFIG_KEYS) {
    vi.stubEnv(key, env[key]);
  }

  const loaded = await import("../../server/config");

  return loaded.serverConfig;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("serverConfig defaults", () => {
  it("falls back to a local Redis on the standard port", async () => {
    const config = await loadConfig({ SYNC_SECRET: "secret" });

    expect(config.redisHost).toBe("localhost");
    expect(config.redisPort).toBe(6379);
    expect(config.serverPort).toBe(3001);
  });

  it("reads host and ports from the environment", async () => {
    const config = await loadConfig({
      SYNC_SECRET: "secret",
      REDIS_HOST: "cache.internal",
      REDIS_PORT: "6380",
      PORT: "8080",
    });

    expect(config.redisHost).toBe("cache.internal");
    expect(config.redisPort).toBe(6380);
    expect(config.serverPort).toBe(8080);
  });

  it("leaves the worker-only and dashboard values empty when unset", async () => {
    const config = await loadConfig({ SYNC_SECRET: "secret" });

    expect(config.webAppUrl).toBe("");
    expect(config.queueDashboardUser).toBe("");
    expect(config.queueDashboardPassword).toBe("");
  });
});

describe("serverConfig validation", () => {
  it("throws when SYNC_SECRET is missing", async () => {
    await expect(loadConfig({})).rejects.toThrow(
      "Missing required env var: SYNC_SECRET",
    );
  });

  it("throws when a port is not a number", async () => {
    await expect(
      loadConfig({ SYNC_SECRET: "secret", PORT: "http" }),
    ).rejects.toThrow("Invalid port in env var PORT: http");
  });

  it("throws when a port is zero or negative", async () => {
    await expect(
      loadConfig({ SYNC_SECRET: "secret", REDIS_PORT: "0" }),
    ).rejects.toThrow("Invalid port in env var REDIS_PORT: 0");
  });

  it("throws when a port is fractional", async () => {
    await expect(
      loadConfig({ SYNC_SECRET: "secret", PORT: "80.5" }),
    ).rejects.toThrow("Invalid port in env var PORT: 80.5");
  });
});
