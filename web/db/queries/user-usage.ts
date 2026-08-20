import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { userUsage } from "@/db/schema";

const EMPTY_USAGE = {
  totalTokensUsed: 0,
  emailCount: 0,
};

// Adds a run's tokens and email count to the user's monthly bucket, creating
// the row on first use of the month.
export async function addUserUsage(
  userId: string,
  month: string,
  tokens: number,
  emailCount: number,
) {
  const db = getDb();

  await db
    .insert(userUsage)
    .values({ userId, month, totalTokensUsed: tokens, emailCount })
    .onConflictDoUpdate({
      target: [userUsage.userId, userUsage.month],
      set: {
        totalTokensUsed: sql`${userUsage.totalTokensUsed} + ${tokens}`,
        emailCount: sql`${userUsage.emailCount} + ${emailCount}`,
        updatedAt: new Date(),
      },
    });
}

// Reads a user's totals for a month; returns zeros when nothing is recorded yet.
export async function getMonthlyUsage(userId: string, month: string) {
  const db = getDb();
  const [row] = await db
    .select({
      totalTokensUsed: userUsage.totalTokensUsed,
      emailCount: userUsage.emailCount,
    })
    .from(userUsage)
    .where(and(eq(userUsage.userId, userId), eq(userUsage.month, month)))
    .limit(1);

  return row ?? EMPTY_USAGE;
}

// Totals across every month, so the dashboard can show history when the
// current month is still empty.
export async function getLifetimeUsage(userId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      totalTokensUsed: sql<number>`coalesce(sum(${userUsage.totalTokensUsed}), 0)`,
      emailCount: sql<number>`coalesce(sum(${userUsage.emailCount}), 0)`,
    })
    .from(userUsage)
    .where(eq(userUsage.userId, userId));

  if (!row) {
    return EMPTY_USAGE;
  }

  return {
    totalTokensUsed: Number(row.totalTokensUsed),
    emailCount: Number(row.emailCount),
  };
}
