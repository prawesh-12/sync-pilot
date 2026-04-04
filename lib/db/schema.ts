import {
    integer,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";

export const PLAN_VALUES = ["free", "pro"] as const;
export const PROVIDER_VALUES = ["gmail"] as const;
export const RUN_STATUS_VALUES = ["success", "error"] as const;

export type PlanValue = (typeof PLAN_VALUES)[number];
export type ProviderValue = (typeof PROVIDER_VALUES)[number];
export type RunStatusValue = (typeof RUN_STATUS_VALUES)[number];

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
            .default("gmail"),
        accessTokenEncrypted: text("access_token_encrypted").notNull(),
        refreshTokenEncrypted: text("refresh_token_encrypted").notNull(),
        lastRunTimestamp: timestamp("last_run_timestamp", {
            withTimezone: true,
        }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        unique("integrations_user_provider_unique").on(
            table.userId,
            table.provider,
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
