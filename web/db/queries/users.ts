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

export async function setUserPlan(userId: string, plan: PlanValue) {
  const db = getDb();
  const [updatedUser] = await db
    .update(users)
    .set({ plan })
    .where(eq(users.id, userId))
    .returning({ id: users.id, plan: users.plan });

  return updatedUser ?? null;
}
