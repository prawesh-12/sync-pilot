import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Mirror the tsconfig "@/*" -> "./*" path alias so tests can import app modules.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
    // Silence app pino logs during tests so the output shows only test results.
    env: { LOG_LEVEL: "silent" },
  },
});
