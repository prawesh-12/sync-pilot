import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users, type PlanValue } from "@/db/schema";

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

// Sign in gives a new random id every time, so match the user by email.
export async function resolveUserIdByEmail(
  email: string,
  fallbackId: string,
): Promise<string> {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return fallbackId;
  }

  const existing = await findUserIdByEmail(normalized);

  if (existing) {
    return existing;
  }

  await getDb()
    .insert(users)
    .values({ id: fallbackId, email: normalized })
    .onConflictDoNothing({ target: users.id });

  // Read again in case another sign in added this email first.
  return (await findUserIdByEmail(normalized)) ?? fallbackId;
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const [row] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return row?.id ?? null;
}

export async function setUserPlan(userId: string, plan: PlanValue) {
  const db = getDb();
  const [updatedUser] = await db
    .update(users)
    .set({ plan })
    .where(eq(users.id, userId))
    .returning({ id: users.id, plan: users.plan });

  return updatedUser ?? null;
}
