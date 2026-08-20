import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests live outside this package root.
const repoRoot = fileURLToPath(new URL("../", import.meta.url));

// Must mirror the path alias used by app imports.
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
    // Keeps test output readable.
    env: { LOG_LEVEL: "silent" },
  },
});
