import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
    agentRuns,
    integrations,
    signalIntegrations,
    users,
    type RunStatusValue,
} from "@/lib/db/schema";

const GMAIL_PROVIDER = "gmail";

type EncryptedTokens = {
    accessTokenEncrypted: string;
    refreshTokenEncrypted: string;
};

type AgentRunResult = {
    emailsFound: number;
    summariesSent: number;
    status: RunStatusValue;
};

type SignalIntegrationInput = {
    deviceName: string;
    senderNumber: string;
    recipientNumber: string;
};

type AppUser = {
    id: string;
    email: string;
};

export async function upsertUser(user: AppUser) {
    const db = getDb();
    const [savedUser] = await db
        .insert(users)
        .values({
            id: user.id,
            email: user.email,
        })
        .onConflictDoUpdate({
            target: users.id,
            set: {
                email: user.email,
            },
        })
        .returning();

    return savedUser;
}

export async function saveIntegration(
    userId: string,
    encryptedTokens: EncryptedTokens,
) {
    const db = getDb();
    const [integration] = await db
        .insert(integrations)
        .values({
            userId,
            provider: GMAIL_PROVIDER,
            accessTokenEncrypted: encryptedTokens.accessTokenEncrypted,
            refreshTokenEncrypted: encryptedTokens.refreshTokenEncrypted,
        })
        .onConflictDoUpdate({
            target: [integrations.userId, integrations.provider],
            set: {
                accessTokenEncrypted: encryptedTokens.accessTokenEncrypted,
                refreshTokenEncrypted: encryptedTokens.refreshTokenEncrypted,
            },
        })
        .returning();

    return integration;
}

export async function getIntegration(userId: string) {
    const db = getDb();
    const [integration] = await db
        .select({
            accessTokenEncrypted: integrations.accessTokenEncrypted,
            refreshTokenEncrypted: integrations.refreshTokenEncrypted,
            lastRunTimestamp: integrations.lastRunTimestamp,
            provider: integrations.provider,
        })
        .from(integrations)
        .where(
            and(
                eq(integrations.userId, userId),
                eq(integrations.provider, GMAIL_PROVIDER),
            ),
        )
        .limit(1);

    return integration ?? null;
}

export async function getUserIdsWithGmailIntegration() {
    const db = getDb();
    const rows = await db
        .selectDistinct({ userId: integrations.userId })
        .from(integrations)
        .where(eq(integrations.provider, GMAIL_PROVIDER));

    return rows.map((row) => row.userId);
}

export async function upsertSignalIntegration(
    userId: string,
    input: SignalIntegrationInput,
) {
    const db = getDb();
    const [integration] = await db
        .insert(signalIntegrations)
        .values({
            userId,
            deviceName: input.deviceName,
            senderNumber: input.senderNumber,
            recipientNumber: input.recipientNumber,
        })
        .onConflictDoUpdate({
            target: signalIntegrations.userId,
            set: {
                deviceName: input.deviceName,
                senderNumber: input.senderNumber,
                recipientNumber: input.recipientNumber,
                updatedAt: new Date(),
            },
        })
        .returning({
            id: signalIntegrations.id,
            userId: signalIntegrations.userId,
            deviceName: signalIntegrations.deviceName,
            senderNumber: signalIntegrations.senderNumber,
            recipientNumber: signalIntegrations.recipientNumber,
            createdAt: signalIntegrations.createdAt,
            updatedAt: signalIntegrations.updatedAt,
        });

    return integration;
}

export async function getSignalIntegration(userId: string) {
    const db = getDb();
    const [integration] = await db
        .select({
            id: signalIntegrations.id,
            userId: signalIntegrations.userId,
            deviceName: signalIntegrations.deviceName,
            senderNumber: signalIntegrations.senderNumber,
            recipientNumber: signalIntegrations.recipientNumber,
            createdAt: signalIntegrations.createdAt,
            updatedAt: signalIntegrations.updatedAt,
        })
        .from(signalIntegrations)
        .where(eq(signalIntegrations.userId, userId))
        .limit(1);

    return integration ?? null;
}

export async function getUserIdsWithSignalIntegration() {
    const db = getDb();
    const rows = await db
        .selectDistinct({ userId: signalIntegrations.userId })
        .from(signalIntegrations);

    return rows.map((row) => row.userId);
}

export async function disconnectSignalIntegration(userId: string) {
    const db = getDb();
    const deletedRows = await db
        .delete(signalIntegrations)
        .where(eq(signalIntegrations.userId, userId))
        .returning({ id: signalIntegrations.id });

    return deletedRows.length > 0;
}

export async function updateIntegrationLastRunTimestamp(
    userId: string,
    lastRunTimestamp: Date,
) {
    const db = getDb();
    const [integration] = await db
        .update(integrations)
        .set({ lastRunTimestamp })
        .where(
            and(
                eq(integrations.userId, userId),
                eq(integrations.provider, GMAIL_PROVIDER),
            ),
        )
        .returning({
            id: integrations.id,
            lastRunTimestamp: integrations.lastRunTimestamp,
        });

    return integration ?? null;
}

export async function getRecentAgentRuns(userId: string, limit = 10) {
    const db = getDb();
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    return db
        .select({
            id: agentRuns.id,
            ranAt: agentRuns.ranAt,
            emailsFound: agentRuns.emailsFound,
            summariesSent: agentRuns.summariesSent,
            status: agentRuns.status,
        })
        .from(agentRuns)
        .where(eq(agentRuns.userId, userId))
        .orderBy(desc(agentRuns.ranAt))
        .limit(safeLimit);
}

export async function disconnectGmailIntegration(userId: string) {
    const db = getDb();
    const deletedRows = await db
        .delete(integrations)
        .where(
            and(
                eq(integrations.userId, userId),
                eq(integrations.provider, GMAIL_PROVIDER),
            ),
        )
        .returning({ id: integrations.id });

    return deletedRows.length > 0;
}

export async function saveAgentRun(userId: string, result: AgentRunResult) {
    const db = getDb();
    const [agentRun] = await db
        .insert(agentRuns)
        .values({
            userId,
            emailsFound: result.emailsFound,
            summariesSent: result.summariesSent,
            status: result.status,
        })
        .returning();

    return agentRun;
}
