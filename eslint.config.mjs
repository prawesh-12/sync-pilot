import testRules from "./web/eslint.tests.mjs";

// ESLint's base path is its working directory, so a config inside web/ can
// never reach the tests/ tree above it. Hence this one, at the repo root.
export default [
  {
    ignores: ["**/node_modules/**", "web/**", "server/**", "extras/**"],
  },
  ...testRules,
];
