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
// Includes later-phase actions now so the decision column type stays stable.
export const DECISION_VALUES = [
    "ignore",
    "summarize_notify",
    "escalate",
    "archive",
    "apply_label",
    "snooze",
    "draft_reply",
] as const;

export type PlanValue = (typeof PLAN_VALUES)[number];
export type ProviderValue = (typeof PROVIDER_VALUES)[number];
export type RunStatusValue = (typeof RUN_STATUS_VALUES)[number];
export type DecisionValue = (typeof DECISION_VALUES)[number];

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
    ranAt: timestamp("ran_at", { withTimezone: true }).notNull().defaultNow(),
});

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
    decision: text("decision").$type<DecisionValue>().notNull(),
    reasoning: text("reasoning").notNull(),
    toolCalls: jsonb("tool_calls"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});
