import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "@/config/env";
import * as schema from "@/db/schema";

const MAX_DATABASE_CONNECTIONS = 10;
const DATABASE_IDLE_TIMEOUT_SECONDS = 20;

let client: postgres.Sql | null = null;
let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

function createClient() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return postgres(databaseUrl, {
    max: MAX_DATABASE_CONNECTIONS,
    idle_timeout: DATABASE_IDLE_TIMEOUT_SECONDS,
    prepare: false,
  });
}

export function getDb() {
  if (!client) {
    client = createClient();
  }

  if (!database) {
    database = drizzle(client, { schema });
  }

  return database;
}
