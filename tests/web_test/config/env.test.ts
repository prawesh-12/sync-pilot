import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getComposioConfig,
  getCronSecret,
  getEnv,
  getGroqConfig,
  getIntakeServerUrl,
  getRazorpayConfig,
  getRazorpayWebhookSecret,
  getSignalConfig,
  getSyncSecret,
  isComposioConfigured,
  isDatabaseConfigured,
  isGroqConfigured,
  isQueueEnabled,
  isRazorpayConfigured,
  isSignalConfigured,
} from "@/config/env";

// Every variable the schema reads. Cases start from all of them cleared so a
// local .env cannot decide the result.
const ENV_KEYS = [
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "DATABASE_URL",
  "COMPOSIO_API_KEY",
  "COMPOSIO_GMAIL_AUTH_CONFIG_ID",
  "COMPOSIO_GMAIL_TOOLKIT_VERSION",
  "ENCRYPTION_KEY",
  "GROQ_API_KEY",
  "GROQ_MODEL",
  "SIGNAL_CLI_REST_URL",
  "SIGNAL_AUTH_TOKEN",
  "SIGNAL_SENDER_NUMBER",
  "SIGNAL_RECIPIENT_NUMBER",
  "CRON_SECRET",
  "SYNC_SECRET",
  "INTAKE_SERVER_URL",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_PLAN_ID",
  "RAZORPAY_WEBHOOK_SECRET",
] as const;

function withEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string>> = {}) {
  for (const key of ENV_KEYS) {
    vi.stubEnv(key, values[key] ?? "");
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getEnv", () => {
  it("defaults every optional value to an empty string", () => {
    withEnv();

    expect(getEnv().DATABASE_URL).toBe("");
  });

  it("trims surrounding whitespace", () => {
    withEnv({ DATABASE_URL: "  postgres://localhost/db  " });

    expect(getEnv().DATABASE_URL).toBe("postgres://localhost/db");
  });
});

describe("Groq configuration", () => {
  it("falls back to the default model when GROQ_MODEL is unset", () => {
    withEnv({ GROQ_API_KEY: "gsk_test" });

    expect(getGroqConfig()).toEqual({
      apiKey: "gsk_test",
      model: "openai/gpt-oss-120b",
    });
  });

  it("uses an explicitly configured model", () => {
    withEnv({ GROQ_API_KEY: "gsk_test", GROQ_MODEL: "llama-3.1-70b" });

    expect(getGroqConfig().model).toBe("llama-3.1-70b");
  });

  it("reports configured only when an API key is present", () => {
    withEnv();
    expect(isGroqConfigured()).toBe(false);

    withEnv({ GROQ_API_KEY: "gsk_test" });
    expect(isGroqConfigured()).toBe(true);
  });
});

describe("database configuration", () => {
  it("reports configured only when DATABASE_URL is set", () => {
    withEnv();
    expect(isDatabaseConfigured()).toBe(false);

    withEnv({ DATABASE_URL: "postgres://localhost/db" });
    expect(isDatabaseConfigured()).toBe(true);
  });
});

describe("Composio configuration", () => {
  it("returns the key, auth config and toolkit version", () => {
    withEnv({
      COMPOSIO_API_KEY: "key",
      COMPOSIO_GMAIL_AUTH_CONFIG_ID: "auth-1",
      COMPOSIO_GMAIL_TOOLKIT_VERSION: "2026-01",
    });

    expect(getComposioConfig()).toEqual({
      apiKey: "key",
      gmailAuthConfigId: "auth-1",
      gmailToolkitVersion: "2026-01",
    });
  });

  it("throws when the API key is missing", () => {
    withEnv({ COMPOSIO_GMAIL_AUTH_CONFIG_ID: "auth-1" });

    expect(getComposioConfig).toThrow("COMPOSIO_API_KEY is not configured.");
  });

  it("throws when the auth config id is missing", () => {
    withEnv({ COMPOSIO_API_KEY: "key" });

    expect(getComposioConfig).toThrow(
      "COMPOSIO_GMAIL_AUTH_CONFIG_ID is not configured.",
    );
  });

  it("does not require the toolkit version to report configured", () => {
    withEnv({ COMPOSIO_API_KEY: "key", COMPOSIO_GMAIL_AUTH_CONFIG_ID: "auth-1" });

    expect(isComposioConfigured()).toBe(true);
  });
});

describe("Signal configuration", () => {
  it("returns the REST URL and token", () => {
    withEnv({ SIGNAL_CLI_REST_URL: "http://signal:8080", SIGNAL_AUTH_TOKEN: "tok" });

    expect(getSignalConfig()).toEqual({
      restUrl: "http://signal:8080",
      authToken: "tok",
    });
  });

  it("throws when the REST URL is missing", () => {
    withEnv({ SIGNAL_AUTH_TOKEN: "tok" });

    expect(getSignalConfig).toThrow("SIGNAL_CLI_REST_URL is not configured.");
  });

  it("reports configured on the REST URL alone, token optional", () => {
    withEnv({ SIGNAL_CLI_REST_URL: "http://signal:8080" });

    expect(isSignalConfigured()).toBe(true);
  });
});

describe("shared secrets", () => {
  it("returns the cron secret when set", () => {
    withEnv({ CRON_SECRET: "cron" });

    expect(getCronSecret()).toBe("cron");
  });

  it("throws when the cron secret is missing", () => {
    withEnv();

    expect(getCronSecret).toThrow("CRON_SECRET is not configured.");
  });

  it("returns the sync secret when set", () => {
    withEnv({ SYNC_SECRET: "sync" });

    expect(getSyncSecret()).toBe("sync");
  });

  it("throws when the sync secret is missing", () => {
    withEnv();

    expect(getSyncSecret).toThrow("SYNC_SECRET is not configured.");
  });
});

describe("queue configuration", () => {
  it("is disabled without an intake server URL", () => {
    withEnv();

    expect(getIntakeServerUrl()).toBe("");
    expect(isQueueEnabled()).toBe(false);
  });

  it("is enabled once an intake server URL is set", () => {
    withEnv({ INTAKE_SERVER_URL: "http://intake:3001" });

    expect(isQueueEnabled()).toBe(true);
  });
});

describe("Razorpay configuration", () => {
  const FULL = {
    RAZORPAY_KEY_ID: "rzp_id",
    RAZORPAY_KEY_SECRET: "rzp_secret",
    RAZORPAY_PLAN_ID: "plan_1",
    RAZORPAY_WEBHOOK_SECRET: "hook",
  };

  it("returns the API keys and plan id", () => {
    withEnv(FULL);

    expect(getRazorpayConfig()).toEqual({
      keyId: "rzp_id",
      keySecret: "rzp_secret",
      planId: "plan_1",
    });
  });

  it("throws when either API key is missing", () => {
    withEnv({ ...FULL, RAZORPAY_KEY_SECRET: "" });

    expect(getRazorpayConfig).toThrow("Razorpay API keys are not configured.");
  });

  it("throws when the plan id is missing", () => {
    withEnv({ ...FULL, RAZORPAY_PLAN_ID: "" });

    expect(getRazorpayConfig).toThrow("RAZORPAY_PLAN_ID is not configured.");
  });

  it("returns the webhook secret when set", () => {
    withEnv(FULL);

    expect(getRazorpayWebhookSecret()).toBe("hook");
  });

  it("throws when the webhook secret is missing", () => {
    withEnv({ ...FULL, RAZORPAY_WEBHOOK_SECRET: "" });

    expect(getRazorpayWebhookSecret).toThrow(
      "RAZORPAY_WEBHOOK_SECRET is not configured.",
    );
  });

  it("reports configured only when all four values are present", () => {
    withEnv(FULL);
    expect(isRazorpayConfigured()).toBe(true);
  });

  // Without the webhook secret every delivery 401s and subscription status
  // never updates, so a missing secret must read as "not configured".
  it("reports not configured when only the webhook secret is missing", () => {
    withEnv({ ...FULL, RAZORPAY_WEBHOOK_SECRET: "" });

    expect(isRazorpayConfigured()).toBe(false);
  });
});
