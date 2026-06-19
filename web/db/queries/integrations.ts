import { cache } from "react";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { integrations, pendingActions, signalIntegrations } from "@/db/schema";

const GMAIL_PROVIDER = "composio";

type GmailAccountInput = {
  connectedAccountId: string;
  emailAddress: string;
  label: string;
};

type SignalIntegrationInput = {
  deviceName: string;
  senderNumber: string;
  recipientNumber: string;
};

export async function saveGmailAccount(userId: string, input: GmailAccountInput) {
  const db = getDb();
  const [account] = await db
    .insert(integrations)
    .values({
      userId,
      provider: GMAIL_PROVIDER,
      connectedAccountId: input.connectedAccountId,
      emailAddress: input.emailAddress,
      label: input.label,
    })
    .onConflictDoUpdate({
      target: [integrations.userId, integrations.connectedAccountId],
      set: {
        emailAddress: input.emailAddress,
        label: input.label,
        isActive: true,
      },
    })
    .returning();

  return account;
}

export const getActiveGmailAccounts = cache(async function getActiveGmailAccounts(
  userId: string,
) {
  const db = getDb();

  return db
    .select({
      id: integrations.id,
      connectedAccountId: integrations.connectedAccountId,
      emailAddress: integrations.emailAddress,
      label: integrations.label,
      lastRunTimestamp: integrations.lastRunTimestamp,
    })
    .from(integrations)
    .where(
      and(
        eq(integrations.userId, userId),
        eq(integrations.provider, GMAIL_PROVIDER),
        eq(integrations.isActive, true),
      ),
    )
    .orderBy(asc(integrations.createdAt));
});

export const getGmailAccounts = cache(async function getGmailAccounts(
  userId: string,
) {
  const db = getDb();

  return db
    .select({
      id: integrations.id,
      connectedAccountId: integrations.connectedAccountId,
      emailAddress: integrations.emailAddress,
      label: integrations.label,
      isActive: integrations.isActive,
      lastRunTimestamp: integrations.lastRunTimestamp,
      createdAt: integrations.createdAt,
    })
    .from(integrations)
    .where(
      and(
        eq(integrations.userId, userId),
        eq(integrations.provider, GMAIL_PROVIDER),
      ),
    )
    .orderBy(asc(integrations.createdAt));
});

export async function getGmailAccountById(integrationId: string) {
  const db = getDb();
  const [account] = await db
    .select({
      id: integrations.id,
      userId: integrations.userId,
      connectedAccountId: integrations.connectedAccountId,
      emailAddress: integrations.emailAddress,
      isActive: integrations.isActive,
      lastRunTimestamp: integrations.lastRunTimestamp,
    })
    .from(integrations)
    .where(eq(integrations.id, integrationId))
    .limit(1);

  return account ?? null;
}

export async function setGmailAccountActive(
  integrationId: string,
  userId: string,
  isActive: boolean,
) {
  const db = getDb();
  const updatedRows = await db
    .update(integrations)
    .set({ isActive })
    .where(
      and(eq(integrations.id, integrationId), eq(integrations.userId, userId)),
    )
    .returning({ id: integrations.id });

  return updatedRows.length > 0;
}

export async function removeGmailAccount(integrationId: string, userId: string) {
  const db = getDb();
  const deletedRows = await db
    .delete(integrations)
    .where(
      and(eq(integrations.id, integrationId), eq(integrations.userId, userId)),
    )
    .returning({ id: integrations.id });

  return deletedRows.length > 0;
}

export async function updateGmailAccountLastRun(
  integrationId: string,
  lastRunTimestamp: Date,
) {
  const db = getDb();
  const [account] = await db
    .update(integrations)
    .set({ lastRunTimestamp })
    .where(eq(integrations.id, integrationId))
    .returning({
      id: integrations.id,
      lastRunTimestamp: integrations.lastRunTimestamp,
    });

  return account ?? null;
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

export async function getSignalIntegrationsWithPendingActions() {
  const db = getDb();

  return db
    .selectDistinct({
      userId: signalIntegrations.userId,
      senderNumber: signalIntegrations.senderNumber,
      recipientNumber: signalIntegrations.recipientNumber,
    })
    .from(signalIntegrations)
    .innerJoin(
      pendingActions,
      and(
        eq(pendingActions.userId, signalIntegrations.userId),
        eq(pendingActions.status, "pending"),
      ),
    );
}

export async function disconnectSignalIntegration(userId: string) {
  const db = getDb();
  const deletedRows = await db
    .delete(signalIntegrations)
    .where(eq(signalIntegrations.userId, userId))
    .returning({ id: signalIntegrations.id });

  return deletedRows.length > 0;
}
