import { config as loadEnv } from "dotenv";

loadEnv();

const DEFAULT_REDIS_HOST = "localhost";
const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_SERVER_PORT = 3001;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function readPort(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid port in env var ${name}: ${raw}`);
  }
  return parsed;
}

export const serverConfig = {
  redisHost: process.env.REDIS_HOST ?? DEFAULT_REDIS_HOST,
  redisPort: readPort("REDIS_PORT", DEFAULT_REDIS_PORT),
  serverPort: readPort("PORT", DEFAULT_SERVER_PORT),
  syncSecret: requireEnv("SYNC_SECRET"),
};
