import { getDb } from "@/db/client";
import { users } from "@/db/schema";

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
