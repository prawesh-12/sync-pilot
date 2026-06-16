import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { userUsage } from "@/db/schema";

const EMPTY_MONTHLY_USAGE = {
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

  return row ?? EMPTY_MONTHLY_USAGE;
}
