import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);

// Tests live in the repo-root tests/ tree, one level above this package.
const repoRoot = fileURLToPath(new URL("../", import.meta.url));

export default defineConfig({
  resolve: {
    // Test files sit outside this package, so a bare "dotenv" specifier there
    // would not resolve to the copy config.ts loads. Pinning both to one file
    // is what lets a test replace it with vi.mock.
    alias: { dotenv: require.resolve("dotenv") },
  },
  server: {
    fs: { allow: [repoRoot] },
  },
  test: {
    environment: "node",
    include: ["../tests/server_test/**/*.test.ts"],
    setupFiles: ["../tests/server_test/setup.ts"],
    exclude: ["node_modules"],
    env: { LOG_LEVEL: "silent" },
  },
});
