# Tests

Every test in the project lives here, split by the package it exercises.

```
tests/
  server_test/   the Express intake server and BullMQ worker (server/)
  web_test/      the Next.js app (web/)
```

## Running them

There is no root package, so each suite runs from its own package. Both use the
vitest already installed there; nothing extra needs installing.

```bash
cd web    && pnpm test     # 215 tests
cd server && pnpm test     # 51 tests
```

`pnpm test:watch` works the same way in both.

The tests sit above `web/`, outside ESLint's base path, so they are linted from
the repo root against the `eslint.config.mjs` there:

```bash
cd web && pnpm run lint:tests
```

## How the wiring works

The tests sit outside the package they test, so each `vitest.config.ts` points
its `include` at this directory and allows Vite to read one level up:

- `web/vitest.config.ts` includes `../tests/web_test/**/*.test.ts` and maps the
  `@/*` alias to the web package, so tests import app modules the same way the
  app does.
- `server/vitest.config.ts` includes `../tests/server_test/**/*.test.ts`. Server
  modules are imported by relative path (`../../server/agent`).

Two details in the server config exist for a reason:

- `setupFiles` sets a placeholder `SYNC_SECRET`, because `server/config.ts`
  throws at import time when it is missing.
- `dotenv` is aliased to one resolved file. Test files live outside
  `server/node_modules`, so without the alias a bare `dotenv` specifier in a
  test would resolve to a different module than the one `config.ts` loads, and
  `vi.mock("dotenv")` would not take effect. `config.test.ts` needs that mock so
  a developer's local `.env` cannot decide whether a test passes.

## What is covered

**Server** — `server` (the `/health` and `/sync` routes, secret checking, job
parsing, and that the queue dashboard stays unmounted without credentials),
`worker` (`processJob` delegating to the agent and propagating failures so
BullMQ retries), `secure-compare` (constant-time secret comparison),
`basic-auth` (the queue dashboard guard), `config` (env parsing and port
validation), `entry-point` (the guard that keeps importing a module from
starting it), and `report-status` and `agent` (both HTTP hops to the web app,
including every failure shape that must throw).

**Web** — `lib/` (encryption round-trip and tamper rejection, Razorpay webhook
signatures, retry/timeout, formatting, redirect sanitizing, decision labels),
`config/` (every accessor in `env.ts`, plan constants against the landing copy), the
Razorpay webhook route handler,
`features/signal/` (ref-code parsing, reply classification, routing, the reply
handler), `features/gmail/` (Composio response readers, label resolution and its
cache), and `features/agent/` (email collection, triage, result parsing and
repair, token accounting, the tool registry and decision recorder).

## Not covered

- Anything that needs a live Postgres, Redis, Gmail, Groq or Signal connection.
  Those boundaries are mocked; there are no integration or browser tests yet.
- React components. No DOM environment or renderer is installed.
