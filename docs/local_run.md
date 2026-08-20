# Run SyncPilot locally

Docker runs Redis and signal-cli. The web app, the intake server, and the worker
run on the host through `./run.sh`, so you keep hot reload.

Expect 20 to 30 minutes the first time, mostly spent creating accounts on the
external services.

## 1. Prerequisites

| Tool | Check | Notes |
| --- | --- | --- |
| Node.js 24+ | `node -v` | CI runs on 24 |
| pnpm 11.7 | `pnpm -v` | `corepack enable` installs it |
| Docker + Compose | `docker compose version` | For Redis and signal-cli |
| A phone with Signal | | You will link it as a second device |

Free accounts needed:

- [Neon](https://neon.tech) for Postgres
- [Composio](https://composio.dev) for the Gmail connection
- [Groq](https://console.groq.com) for the model
- Google Cloud Console for OAuth sign-in

## 2. Clone and install

```bash
git clone https://github.com/your-username/your-repo.git syncpilot
cd syncpilot
pnpm install --dir web
pnpm install --dir server
```

`web/` and `server/` are separate pnpm projects with their own lockfiles.

## 3. Start Redis and signal-cli

```bash
docker compose up -d
docker compose ps
```

You should see `syncpilot-redis-local` and `syncpilot-signal-local` running.

## 4. Create the database

Postgres is not in the compose file. `web/db/client.ts` uses the Neon HTTP
driver, which sends each query over HTTP rather than opening a TCP connection,
so a plain Postgres container cannot serve it.

Create a free project at [neon.tech](https://neon.tech) and copy the connection
string:

```text
postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require
```

## 5. Generate secrets

```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -hex 32      # ENCRYPTION_KEY (exactly 64 hex characters)
openssl rand -hex 32      # CRON_SECRET
openssl rand -hex 32      # SYNC_SECRET
```

## 6. Create the env files

Two files, one per package. Both are gitignored.

```bash
cp web/.env.example web/.env.local
cp server/.env.example server/.env.local
```

`web/.env.local`:

```env
AUTH_SECRET=<from step 5>
AUTH_GOOGLE_ID=<Google OAuth client id>
AUTH_GOOGLE_SECRET=<Google OAuth client secret>

DATABASE_URL=<Neon connection string>

COMPOSIO_API_KEY=<Composio API key>
COMPOSIO_GMAIL_AUTH_CONFIG_ID=<Composio Gmail auth config id>

ENCRYPTION_KEY=<from step 5>

GROQ_API_KEY=<Groq API key>
GROQ_MODEL=openai/gpt-oss-120b

SIGNAL_CLI_REST_URL=http://localhost:8080
SIGNAL_AUTH_TOKEN=

CRON_SECRET=<from step 5>
SYNC_SECRET=<from step 5>
INTAKE_SERVER_URL=http://localhost:3001
```

`server/.env.local`:

```env
SYNC_SECRET=<same value as web/.env.local>

REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
WEB_APP_URL=http://localhost:3000

QUEUE_DASHBOARD_USER=admin
QUEUE_DASHBOARD_PASSWORD=admin
```

Notes:

- `SYNC_SECRET` must match in both files.
- `REDIS_HOST` is `localhost` locally because the intake server runs on the
  host. In production it must be `redis`, the Compose service name.
- Leave `SIGNAL_AUTH_TOKEN` empty locally. There is no proxy in front of
  `localhost:8080`.
- `INTAKE_SERVER_URL` set means the cron queues one job per account. Leave it
  blank to run accounts inline instead.

## 7. Configure Google OAuth

In Google Cloud Console, open your OAuth client and add:

- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- Authorized JavaScript origin: `http://localhost:3000`

## 8. Create the database tables

```bash
cd web
pnpm db:migrate
```

No auto migrate exists anywhere, including production. After changing
`web/db/schema.ts`, run `pnpm db:generate` then `pnpm db:migrate`.

## 9. Start everything

From the repo root:

```bash
./run.sh
```

That starts three processes and prefixes each line of output:

| Prefix | Process | Port |
| --- | --- | --- |
| `[web]` | Next.js dev server | 3000 |
| `[server]` | Express intake API | 3001 |
| `[worker]` | BullMQ worker | |

Ctrl+C stops all three. Open `http://localhost:3000`.

`run.sh` checks that `web/.env.local` and `server/.env.local` exist and that
both packages have `node_modules`, and warns if ports 6379 or 8080 are closed.

To run a piece on its own instead:

```bash
cd web && pnpm dev
cd server && pnpm dev      # intake API
cd server && pnpm worker   # worker
```

## 10. Connect Gmail and Signal

1. Sign in with Google.
2. Settings, then connect a Gmail account. Composio handles the Gmail OAuth
   flow. SyncPilot never holds Gmail tokens.
3. Open the Signal card and show the QR code.
4. On your phone: Signal, Settings, Linked devices, `+`, scan the code.

The agent only picks up accounts where the user has **both** Gmail and Signal
connected. If either is missing, runs return zero accounts.

## 11. Trigger a run by hand

Nothing is scheduled locally. Call the cron endpoints yourself:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/fetch-emails
```

With `INTAKE_SERVER_URL` set:

```json
{ "mode": "queued", "accountsQueued": 1 }
```

With it blank:

```json
{ "mode": "inline", "accountsProcessed": 1, "successfulRuns": 1, "failedRuns": 0, "runs": [] }
```

Watch the queue at `http://localhost:3001/admin/queues` (Basic auth, using
`QUEUE_DASHBOARD_USER` and `QUEUE_DASHBOARD_PASSWORD`).

You should get a Signal message. Drafts arrive with a 4 character ref code.
Reply on Signal, then drain the reply:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/poll-signal-replies
```

Reply grammar is `<REF> <command>`:

| Reply | Effect |
| --- | --- |
| `A3X9 send` or `A3X9 yes` | Send the drafted email |
| `A3X9 no` or `A3X9 discard` | Throw the draft away |
| `A3X9 make it shorter` | Rewrite the draft with that instruction |
| `A3X9` alone | Reply with the usage help |

Pending drafts expire after 24 hours, after which the ref code stops matching.

## 12. Production mode on your machine

```bash
./run.sh production
```

Differences from local mode:

- Reads `web/.env.production` and `server/.env.production`.
- Runs `next build`, then `next start`, so there is no hot reload.
- Starts the server and worker without file watching.

Create the two files first:

```bash
cp web/.env.example web/.env.production
cp server/.env.example server/.env.production
```

## 13. Logs

Every process writes JSON lines to stdout:

```json
{"time":"...","level":"info","scope":"AGENT","msg":"triaging email"}
```

`LOG_LEVEL` accepts `debug`, `info` (default), `warn`, `error`, and `silent`.
Set it in the env file of the package you want to change.

To send logs, traces, and metrics to Grafana Cloud as well, see
**[observability.md](observability.md)**. Telemetry is off unless
`OTEL_EXPORTER_OTLP_ENDPOINT` is set.

## 14. Common problems

**Nothing happens and no error appears.** The account is missing a Gmail or
Signal link. Check Settings.

**`run.sh` says dependencies are missing.** Run `pnpm install` in the package it
names.

**`run.sh` says an env file is missing.** It prints the exact `cp` command to
fix it.

**`ENCRYPTION_KEY` errors.** It must be exactly 64 hex characters. Use
`openssl rand -hex 32`.

**Signal QR does not load.** Check `docker logs syncpilot-signal-local`. Confirm
`SIGNAL_CLI_REST_URL` is `http://localhost:8080`.

**Signal stops receiving replies.** Pull a newer image. An outdated signal-cli
throws a `getServerGuid` error and drops inbound messages silently:

```bash
docker compose pull signal-api
docker compose up -d
```

**Database errors about missing tables.** Run `pnpm db:migrate` in `web/`.

**Queue jobs stay in `wait`.** The worker is not running, or `REDIS_HOST` is
wrong. Check with `docker exec syncpilot-redis-local redis-cli ping`.

**`pnpm install` exits 1 on ignored build scripts.** `pnpm-workspace.yaml` in
each package lists which packages may run install scripts under `allowBuilds`.
Set the named package to `true` or `false`.

## 15. Stopping

Ctrl+C stops the three app processes. Then:

```bash
docker compose down          # stop the containers
docker compose down -v       # also delete the Redis queue data
```

Neither touches your Signal device link. That data is a bind mount to
`server/signal-cli-config/signal-cli-config/`, not a Docker volume. Only
deleting that directory loses the link.

`-v` deletes the `redis-data` volume, which drops any queued jobs.
