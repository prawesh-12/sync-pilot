import { cache } from "react";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { integrations, signalIntegrations } from "@/db/schema";

const GMAIL_PROVIDER = "composio";

type ComposioIntegration = {
  connectedAccountId: string;
};

type SignalIntegrationInput = {
  deviceName: string;
  senderNumber: string;
  recipientNumber: string;
};

export async function saveIntegration(
  userId: string,
  composioIntegration: ComposioIntegration,
) {
  const db = getDb();
  const [integration] = await db
    .insert(integrations)
    .values({
      userId,
      provider: GMAIL_PROVIDER,
      connectedAccountId: composioIntegration.connectedAccountId,
    })
    .onConflictDoUpdate({
      target: [integrations.userId, integrations.provider],
      set: {
        connectedAccountId: composioIntegration.connectedAccountId,
      },
    })
    .returning();

  return integration;
}

export const getIntegration = cache(async function getIntegration(userId: string) {
  const db = getDb();
  const [integration] = await db
    .select({
      connectedAccountId: integrations.connectedAccountId,
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
});

export async function getUserIdsWithGmailIntegration() {
  const db = getDb();
  const rows = await db
    .selectDistinct({ userId: integrations.userId })
    .from(integrations)
    .where(eq(integrations.provider, GMAIL_PROVIDER));

  return rows.map((row) => row.userId);
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
