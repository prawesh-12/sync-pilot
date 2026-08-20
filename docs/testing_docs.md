# Testing

266 tests across 30 files, all run with [Vitest](https://vitest.dev) 4.

```
Test Files  22 passed (22)      web
     Tests  215 passed (215)

Test Files   8 passed (8)       server
     Tests   51 passed (51)
```

Both suites finish in under 3 seconds because nothing touches a network or a
database.

## Running them

```bash
cd web && pnpm test          # 215 tests
cd server && pnpm test       # 51 tests

pnpm test:watch              # either package, watch mode
pnpm run typecheck           # tsc --noEmit
```

There is no root level test command. `web/` and `server/` are separate pnpm
projects with separate lockfiles, so each runs its own suite.

## Layout

Every test lives in the repo root `tests/` directory, not next to the code:

```
tests/
  web_test/         mirrors web/
    api/
    config/
    features/agent/
    features/gmail/
    features/signal/
    lib/
  server_test/      mirrors server/
    setup.ts
```

The directory tree under `tests/web_test/` mirrors `web/`, so
`web/lib/encryption.ts` is tested by `tests/web_test/lib/encryption.test.ts`.

Keeping tests outside the packages means `server/` can be deployed with a sparse
git checkout that never pulls the test tree.

## The config that makes this work

Tests sit one level above the packages, so both `vitest.config.ts` files grant
Vite explicit permission to read outside its own root:

```ts
server: { fs: { allow: [repoRoot] } }
test:   { include: ["../tests/web_test/**/*.test.ts"] }
```

Two more details worth knowing:

**`web/vitest.config.ts`** mirrors the tsconfig `@/*` path alias so tests import
app modules the same way the app does.

**`server/vitest.config.ts`** pins `dotenv` to a single resolved file:

```ts
resolve: { alias: { dotenv: require.resolve("dotenv") } }
```

Without this, a bare `dotenv` import in a test file resolves to a different copy
than the one `server/config.ts` loads, and `vi.mock("dotenv")` silently fails to
replace it.

**`tests/server_test/setup.ts`** sets a placeholder `SYNC_SECRET` before any
module loads, because `server/config.ts` throws at import time when it is
missing.

Both suites run with `LOG_LEVEL: silent` so pino output does not bury the test
results.

## How things are tested

All unit tests. External services are mocked at the module boundary:

```ts
const runAgent = vi.fn();
vi.mock("../../server/agent", () => ({ runAgent }));
// bullmq is only needed for startWorker, which this file never calls.
vi.mock("bullmq", () => ({ Worker: class {} }));

const { processJob } = await import("../../server/worker");
```

The dynamic `await import` after `vi.mock` matters. A static import would bind
the real module before the mock is registered.

What gets covered:

| Area   | Files | Examples                                                     |
| ------ | ----- | ------------------------------------------------------------ |
| Agent  | 6     | tool dispatch, triage decisions, result parsing, token usage |
| Signal | 3     | reply parsing, ref code extraction, routing, handling        |
| Gmail  | 2     | message parsing, label handling                              |
| Lib    | 7     | encryption, retry, timing safe compare, formatting           |
| Config | 3     | env validation, plan limits, Signal auth headers             |
| API    | 1     | Razorpay webhook signature and idempotency                   |
| Server | 8     | auth, queue, worker, status reporting, entry point guard     |

Some tests exist specifically to pin behaviour that is easy to break:

- `processJob` must **propagate** a rejection rather than swallow it, because
  that rejection is what makes BullMQ retry.
- `entry-point.test.ts` covers the guard that stops `server.ts` binding a port
  when it is imported by a test instead of run directly.
- `secure-compare.test.ts` exists in both suites because both packages have
  their own copy of the comparison.

## What is not tested

Stated plainly so the numbers are not read as more than they are:

- **No integration tests.** Nothing runs against a real Postgres, Redis, or
  signal-cli.
- **No end to end tests.** No browser automation.
- **No React component tests.** The UI is unverified by the suite.
- **No database query tests.** Everything in `web/db/queries/` is mocked at the
  call site.
- **No coverage reporting** is configured.

The suite protects the logic that decides things: parsing, triage, routing,
crypto, and auth. It does not prove the system works when wired together. That
still needs the manual checks in `docs/prod_deploy_aws_lightsail.md`.

## CI

`.github/workflows/ci.yml` runs on every push to `main` and every pull request.

Three jobs:

**`test-layout`** fails the build if any `*.test.ts` file exists outside
`tests/`:

```bash
stray=$(git ls-files '*.test.ts' '*.test.tsx' | grep -v '^tests/' || true)
```

This guards a real failure mode. A test file outside `tests/` matches no vitest
include glob, so it never runs and CI still passes green. Without this check a
test could be silently dead for months.

**`check`** runs as a matrix over `[web, server]`, doing `pnpm run typecheck`
then `pnpm run test` in each. `fail-fast: false` so one package failing still
shows you the other's result.

**`lint`** runs ESLint on `web/`, plus `lint:tests` for the `tests/` tree, which
sits outside ESLint's base path and needs a separate invocation.

CI runs on Node 24. Node 20 is too old for the pnpm version this repo pins.

## what will be theDeploy gating

`.github/workflows/deploy-server.yml` runs `typecheck` and `test` for `server/`
again before it builds the image.

That duplicates the `check` job on purpose. `ci.yml` and the deploy workflow are
separate workflows triggered by the same push, and one workflow cannot block
another. Without the repeated check, a red test would still ship an image to the
server.
