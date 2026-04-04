import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./config/env";

loadEnv({ path: ".env.local" });
loadEnv();

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured.");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
