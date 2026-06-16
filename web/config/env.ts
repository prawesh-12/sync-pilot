import { z } from "zod";

const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

const envSchema = z.object({
    AUTH_SECRET: z.string().trim().optional().default(""),
    AUTH_GOOGLE_ID: z.string().trim().optional().default(""),
    AUTH_GOOGLE_SECRET: z.string().trim().optional().default(""),
    DATABASE_URL: z.string().trim().optional().default(""),
    COMPOSIO_API_KEY: z.string().trim().optional().default(""),
    COMPOSIO_GMAIL_AUTH_CONFIG_ID: z.string().trim().optional().default(""),
    COMPOSIO_GMAIL_TOOLKIT_VERSION: z.string().trim().optional().default(""),
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
    SYNC_SECRET: z.string().trim().optional().default(""),
    RAZORPAY_KEY_ID: z.string().trim().optional().default(""),
    RAZORPAY_KEY_SECRET: z.string().trim().optional().default(""),
    RAZORPAY_PLAN_ID: z.string().trim().optional().default(""),
    RAZORPAY_WEBHOOK_SECRET: z.string().trim().optional().default(""),
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

export function getComposioConfig() {
    const env = getEnv();

    if (!env.COMPOSIO_API_KEY) {
        throw new Error("COMPOSIO_API_KEY is not configured.");
    }

    if (!env.COMPOSIO_GMAIL_AUTH_CONFIG_ID) {
        throw new Error("COMPOSIO_GMAIL_AUTH_CONFIG_ID is not configured.");
    }

    return {
        apiKey: env.COMPOSIO_API_KEY,
        gmailAuthConfigId: env.COMPOSIO_GMAIL_AUTH_CONFIG_ID,
        gmailToolkitVersion: env.COMPOSIO_GMAIL_TOOLKIT_VERSION,
    };
}

export function isComposioConfigured() {
    const env = getEnv();

    return Boolean(
        env.COMPOSIO_API_KEY && env.COMPOSIO_GMAIL_AUTH_CONFIG_ID,
    );
}

export function getSignalConfig() {
    const env = getEnv();

    if (!env.SIGNAL_CLI_REST_URL) {
        throw new Error("SIGNAL_CLI_REST_URL is not configured.");
    }

    return {
        restUrl: env.SIGNAL_CLI_REST_URL,
    };
}

export function isSignalConfigured() {
    const env = getEnv();

    return Boolean(env.SIGNAL_CLI_REST_URL);
}

export function getCronSecret() {
    const env = getEnv();

    if (!env.CRON_SECRET) {
        throw new Error("CRON_SECRET is not configured.");
    }

    return env.CRON_SECRET;
}

export function getSyncSecret() {
    const env = getEnv();

    if (!env.SYNC_SECRET) {
        throw new Error("SYNC_SECRET is not configured.");
    }

    return env.SYNC_SECRET;
}

export function getRazorpayConfig() {
    const env = getEnv();

    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay API keys are not configured.");
    }

    if (!env.RAZORPAY_PLAN_ID) {
        throw new Error("RAZORPAY_PLAN_ID is not configured.");
    }

    return {
        keyId: env.RAZORPAY_KEY_ID,
        keySecret: env.RAZORPAY_KEY_SECRET,
        planId: env.RAZORPAY_PLAN_ID,
    };
}

export function getRazorpayWebhookSecret() {
    const env = getEnv();

    if (!env.RAZORPAY_WEBHOOK_SECRET) {
        throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured.");
    }

    return env.RAZORPAY_WEBHOOK_SECRET;
}

export function isRazorpayConfigured() {
    const env = getEnv();

    return Boolean(
        env.RAZORPAY_KEY_ID &&
            env.RAZORPAY_KEY_SECRET &&
            env.RAZORPAY_PLAN_ID,
    );
}
