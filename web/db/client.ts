import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getDatabaseUrl } from "@/config/env";
import * as schema from "@/db/schema";

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

function createDatabase() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  // Neon's HTTP driver is stateless (one fetch per query) so there are no
  // long-lived TCP sockets to go stale between serverless invocations and no
  // cold-connect timeouts when Neon's compute wakes from idle.
  const sql = neon(databaseUrl);

  return drizzle(sql, { schema });
}

export function getDb() {
  if (!database) {
    database = createDatabase();
  }

  return database;
}
