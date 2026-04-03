import { z } from "zod";

const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

const envSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().trim().optional().default(""),
  CLERK_SECRET_KEY: z.string().trim().optional().default(""),
  DATABASE_URL: z.string().trim().optional().default(""),
  GOOGLE_CLIENT_ID: z.string().trim().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().trim().optional().default(""),
  GOOGLE_REDIRECT_URI: z.string().trim().optional().default(""),
  ENCRYPTION_KEY: z.string().trim().optional().default(""),
  GROQ_API_KEY: z.string().trim().optional().default(""),
  GROQ_MODEL: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || DEFAULT_GROQ_MODEL),
  SIGNAL_CLI_REST_URL: z.string().trim().optional().default(""),
  SIGNAL_SENDER_NUMBER: z.string().trim().optional().default(""),
  SIGNAL_RECIPIENT_NUMBER: z.string().trim().optional().default(""),
  CRON_SECRET: z.string().trim().optional().default(""),
});

export function getEnv() {
  return envSchema.parse(process.env);
}

export function getGroqConfig() {
  const env = getEnv();

  return {
    apiKey: env.GROQ_API_KEY,
    model: env.GROQ_MODEL,
  };
}

export function isGroqConfigured() {
  return Boolean(getEnv().GROQ_API_KEY);
}

export function getDatabaseUrl() {
  return getEnv().DATABASE_URL;
}

export function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl());
}

export function getGoogleOAuthConfig() {
  const env = getEnv();

  if (!env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not configured.");
  }

  if (!env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET is not configured.");
  }

  if (!env.GOOGLE_REDIRECT_URI) {
    throw new Error("GOOGLE_REDIRECT_URI is not configured.");
  }

  return {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
  };
}

export function isGoogleOAuthConfigured() {
  const env = getEnv();

  return Boolean(
    env.GOOGLE_CLIENT_ID &&
      env.GOOGLE_CLIENT_SECRET &&
      env.GOOGLE_REDIRECT_URI,
  );
}

export function getSignalConfig() {
  const env = getEnv();

  if (!env.SIGNAL_CLI_REST_URL) {
    throw new Error("SIGNAL_CLI_REST_URL is not configured.");
  }

  if (!env.SIGNAL_SENDER_NUMBER) {
    throw new Error("SIGNAL_SENDER_NUMBER is not configured.");
  }

  if (!env.SIGNAL_RECIPIENT_NUMBER) {
    throw new Error("SIGNAL_RECIPIENT_NUMBER is not configured.");
  }

  return {
    restUrl: env.SIGNAL_CLI_REST_URL,
    senderNumber: env.SIGNAL_SENDER_NUMBER,
    recipientNumber: env.SIGNAL_RECIPIENT_NUMBER,
  };
}

export function isSignalConfigured() {
  const env = getEnv();

  return Boolean(
    env.SIGNAL_CLI_REST_URL &&
      env.SIGNAL_SENDER_NUMBER &&
      env.SIGNAL_RECIPIENT_NUMBER,
  );
}
