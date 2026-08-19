import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests live in the repo-root tests/ tree, one level above this package, so
// Vite needs explicit permission to read outside its own root.
const repoRoot = fileURLToPath(new URL("../", import.meta.url));

// Mirror the tsconfig "@/*" -> "./*" path alias so tests can import app modules.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  server: {
    fs: { allow: [repoRoot] },
  },
  test: {
    environment: "node",
    include: ["../tests/web_test/**/*.test.ts"],
    exclude: ["node_modules", ".next"],
    // Silence app pino logs during tests so the output shows only test results.
    env: { LOG_LEVEL: "silent" },
  },
});
