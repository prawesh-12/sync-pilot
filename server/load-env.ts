import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";

const DEFAULT_MODE = "local";

export function loadServerEnv(): void {
  const mode = process.env.APP_ENV?.trim() || DEFAULT_MODE;
  const path = fileURLToPath(new URL(`.env.${mode}`, import.meta.url));

  loadEnv({ path, quiet: true });
}
