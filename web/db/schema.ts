import {
    boolean,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";

export const PLAN_VALUES = ["free", "pro"] as const;
export const PROVIDER_VALUES = ["composio"] as const;
export const RUN_STATUS_VALUES = ["success", "error"] as const;
export const PROCESSED_EMAIL_STATUS_VALUES = [
    "active",
    "snoozed",
    "archived",
    "drafted",
    "notified",
] as const;
// Lists every action up front so the decision column type stays stable.
export const DECISION_VALUES = [
    "ignore",
    "summarize_notify",
    "escalate",
    "archive",
    "apply_label",
    "snooze",
    "draft_reply",
] as const;
export const PENDING_ACTION_TYPE_VALUES = [
    "draft_reply",
    "confirm_archive",
] as const;
export const PENDING_ACTION_STATUS_VALUES = [
    "pending",
    "confirmed",
    "discarded",
    "expired",
] as const;
export const SUBSCRIPTION_STATUS_VALUES = [
    "created",
    "active",
    "cancelled",
    "expired",
] as const;
// How the user pushed back on an agent decision via Signal.
export const FEEDBACK_ACTION_VALUES = ["discarded", "overridden"] as const;

export type PlanValue = (typeof PLAN_VALUES)[number];
export type ProviderValue = (typeof PROVIDER_VALUES)[number];
export type RunStatusValue = (typeof RUN_STATUS_VALUES)[number];
export type DecisionValue = (typeof DECISION_VALUES)[number];
export type ProcessedEmailStatusValue =
    (typeof PROCESSED_EMAIL_STATUS_VALUES)[number];
export type PendingActionTypeValue =
    (typeof PENDING_ACTION_TYPE_VALUES)[number];
export type PendingActionStatusValue =
    (typeof PENDING_ACTION_STATUS_VALUES)[number];
export type SubscriptionStatusValue =
    (typeof SUBSCRIPTION_STATUS_VALUES)[number];
export type FeedbackActionValue = (typeof FEEDBACK_ACTION_VALUES)[number];

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    plan: text("plan").$type<PlanValue>().notNull().default("free"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const integrations = pgTable(
    "integrations",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        provider: text("provider")
            .$type<ProviderValue>()
            .notNull()
            .default("composio"),
        connectedAccountId: text("connected_account_id"),
        emailAddress: text("email_address"),
        label: text("label"),
        isActive: boolean("is_active").notNull().default(true),
        accessTokenEncrypted: text("access_token_encrypted"),
        refreshTokenEncrypted: text("refresh_token_encrypted"),
        lastRunTimestamp: timestamp("last_run_timestamp", {
            withTimezone: true,
        }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    // One user can link many Gmail accounts; uniqueness is per connected account.
    (table) => [
        unique("integrations_user_connected_account_unique").on(
            table.userId,
            table.connectedAccountId,
        ),
    ],
);

export const signalIntegrations = pgTable(
    "signal_integrations",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        deviceName: text("device_name").notNull(),
        senderNumber: text("sender_number").notNull(),
        recipientNumber: text("recipient_number").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [unique("signal_integrations_user_unique").on(table.userId)],
);

export const processedEmails = pgTable("processed_emails", {
    messageId: text("message_id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    status: text("status")
        .$type<ProcessedEmailStatusValue>()
        .notNull()
        .default("active"),
    // Set only while snoozed; null once the email returns to triage.
    snoozedUntil: timestamp("snoozed_until", { withTimezone: true }),
    gmailDraftId: text("gmail_draft_id"),
    processedAt: timestamp("processed_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const agentRuns = pgTable("agent_runs", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    emailsFound: integer("emails_found").notNull(),
    summariesSent: integer("summaries_sent").notNull(),
    status: text("status").$type<RunStatusValue>().notNull(),
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    ranAt: timestamp("ran_at", { withTimezone: true }).notNull().defaultNow(),
});

// Per-user, per-month token + email totals; one row per (userId, month).
export const userUsage = pgTable(
    "user_usage",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        // Calendar month bucket in UTC, formatted as "YYYY-MM".
        month: text("month").notNull(),
        totalTokensUsed: integer("total_tokens_used").notNull().default(0),
        emailCount: integer("email_count").notNull().default(0),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [unique("user_usage_user_month_unique").on(table.userId, table.month)],
);

// One row per email per run so every agent action stays auditable.
export const agentDecisions = pgTable("agent_decisions", {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
        .notNull()
        .references(() => agentRuns.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    gmailMessageId: text("gmail_message_id").notNull(),
    // Email subject captured at decision time so the audit view needs no re-fetch.
    subject: text("subject"),
    decision: text("decision").$type<DecisionValue>().notNull(),
    reasoning: text("reasoning").notNull(),
    toolCalls: jsonb("tool_calls"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

// Records when the user overrode an agent decision via Signal; a short digest
// of recent rows is folded back into the triage prompt as a cheap feedback loop.
export const agentFeedback = pgTable("agent_feedback", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    gmailMessageId: text("gmail_message_id").notNull(),
    subject: text("subject"),
    // The decision the agent originally made for this email.
    decision: text("decision").$type<DecisionValue>().notNull(),
    action: text("action").$type<FeedbackActionValue>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

// One billing subscription per user; mirrors the user's plan for history/webhooks.
export const subscriptions = pgTable(
    "subscriptions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        plan: text("plan").$type<PlanValue>().notNull().default("free"),
        razorpaySubscriptionId: text("razorpay_subscription_id"),
        status: text("status")
            .$type<SubscriptionStatusValue>()
            .notNull()
            .default("created"),
        currentPeriodEnd: timestamp("current_period_end", {
            withTimezone: true,
        }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        unique("subscriptions_user_unique").on(table.userId),
        unique("subscriptions_razorpay_id_unique").on(
            table.razorpaySubscriptionId,
        ),
    ],
);

// A draft or action awaiting the user's Signal confirmation, keyed by refCode.
export const pendingActions = pgTable("pending_actions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    gmailMessageId: text("gmail_message_id").notNull(),
    actionType: text("action_type")
        .$type<PendingActionTypeValue>()
        .notNull(),
    payload: jsonb("payload"),
    refCode: text("ref_code").notNull(),
    status: text("status")
        .$type<PendingActionStatusValue>()
        .notNull()
        .default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});
