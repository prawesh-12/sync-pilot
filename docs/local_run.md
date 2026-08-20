# Run SyncPilot locally

This gets the app running on your machine. Docker runs only the supporting
services (Redis and signal-cli). The web app and the intake server run directly
with pnpm so you keep hot reload.

Expect 20 to 30 minutes the first time, mostly spent creating accounts on the
external services.

## 1. Prerequisites

| Tool | Check | Notes |
| --- | --- | --- |
| Node.js 24+ | `node -v` | CI runs on 24 |
| pnpm 11+ | `pnpm -v` | `corepack enable` installs it |
| Docker + Compose | `docker compose version` | For Redis and signal-cli |
| A phone with Signal | | You will link it as a second device |

You also need free accounts on:

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

`web/` and `server/` are separate pnpm projects with their own lockfiles, so
they install separately.

## 3. Start the supporting services

```bash
docker compose up -d
docker compose ps
```

You should see `syncpilot-redis-local` and `syncpilot-signal-local` running.

This replaces the older `server/signal-cli-config/docker-compose.yml`. Use the
root file so Redis and signal-cli come up together.

## 4. Create the database

Postgres is not in the compose file, and that is on purpose.
`web/db/client.ts` uses the Neon HTTP driver (`@neondatabase/serverless`), which
sends each query as an HTTP request to a Neon endpoint. It does not open a TCP
connection, so a plain Postgres container cannot serve it.

Create a free project at [neon.tech](https://neon.tech) and copy the connection
string. It looks like this:

```text
postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require
```

## 5. Generate local secrets

```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -hex 32      # ENCRYPTION_KEY (must be exactly 64 hex characters)
openssl rand -hex 32      # CRON_SECRET
```

## 6. Create `web/.env.local`

```bash
cp web/.env.example web/.env.local
```

Fill in what you collected. Every variable is documented in
`web/.env.example`. The ones that matter for a first run:

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

SYNC_SECRET=
INTAKE_SERVER_URL=
```

Two notes:

- Leave `SIGNAL_AUTH_TOKEN` empty locally. It exists so a reverse proxy in
  production can reject requests without a matching `X-Signal-Auth` header.
  There is no proxy in front of `localhost:8080`.
- Leave `INTAKE_SERVER_URL` empty. When it is blank, the `fetch-emails` cron
  runs each Gmail account inline instead of pushing to the queue. That is the
  simplest path for local work. Section 11 covers turning the queue on.

## 7. Configure Google OAuth

In Google Cloud Console, open your OAuth client and add:

- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- Authorized JavaScript origin: `http://localhost:3000`

## 8. Create the database tables

```bash
cd web
pnpm db:migrate
```

There is no auto migrate anywhere in this project, including production. If you
change `web/db/schema.ts`, run `pnpm db:generate` and then `pnpm db:migrate`.

## 9. Start the web app

```bash
cd web
pnpm dev
```

Open `http://localhost:3000`.

## 10. Connect Gmail and Signal

In the app:

1. Sign in with Google.
2. Go to Settings and connect a Gmail account. This redirects to Composio,
   which handles the Gmail OAuth flow. SyncPilot never holds Gmail tokens.
3. Open the Signal card and show the QR code.
4. On your phone: Signal, then Settings, then Linked devices, then `+`, then
   scan the code.

The agent only picks up accounts belonging to a user who has **both** Gmail and
Signal connected. If either is missing, runs return zero accounts and nothing
appears to happen.

## 11. Trigger a run by hand

Nothing is scheduled locally. Call the cron endpoints yourself:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/fetch-emails
```

Expected response with the queue off:

```json
{ "mode": "inline", "accountsProcessed": 1, "successfulRuns": 1, "failedRuns": 0, "runs": [] }
```

You should get a Signal message on your phone. If the agent drafted a reply, it
comes with a 4 character ref code. Reply on Signal, then drain the reply:

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

## 12. Optional: run the queue path

Only needed if you want to exercise the same path production uses.

Set these in `web/.env.local`:

```env
SYNC_SECRET=<any value, must match server/.env>
INTAKE_SERVER_URL=http://localhost:3001
```

Create `server/.env`:

```bash
cp server/.env.example server/.env
```

```env
SYNC_SECRET=<same value as web/.env.local>
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
WEB_APP_URL=http://localhost:3000
QUEUE_DASHBOARD_USER=admin
QUEUE_DASHBOARD_PASSWORD=admin
```

`REDIS_HOST` is `localhost` here because the intake server runs on your machine
and Redis publishes port 6379. In production the worker runs inside Docker
Compose and the value must be `redis`, the service name. Getting this wrong
fails silently: `/health` still returns ok and jobs simply never run.

Run the two processes in separate terminals:

```bash
cd server && pnpm dev      # intake API on :3001
cd server && pnpm worker   # BullMQ worker
```

Now `fetch-emails` returns `{"mode":"queued","accountsQueued":N}` instead of
running inline. Watch the queue at `http://localhost:3001/admin/queues`.

## 13. Common problems

**Nothing happens and no error appears.** The account is probably missing a
Gmail or Signal link. Check Settings.

**`ENCRYPTION_KEY` errors.** It must be exactly 64 hex characters. Use
`openssl rand -hex 32`.

**Signal QR does not load.** Check the container: `docker logs
syncpilot-signal-local`. Confirm `SIGNAL_CLI_REST_URL` is
`http://localhost:8080`.

**Signal stops receiving replies.** Pull a newer image. An outdated signal-cli
throws a `getServerGuid` error and drops inbound messages without failing
loudly:

```bash
docker compose pull signal-api
docker compose up -d
```

**Database errors about missing tables.** Run `pnpm db:migrate` in `web/`.

**Queue jobs stay in `wait`.** The worker is not running, or `REDIS_HOST` is
wrong. Check with `docker exec syncpilot-redis-local redis-cli ping`.

## Optional: send telemetry to Grafana Cloud

Not needed for local work. If you want traces, metrics, and logs while
developing, **[observability.md](observability.md)** covers the four `OTEL_*`
variables and where to get their values.

## Stopping

```bash
docker compose down          # stop the containers
docker compose down -v       # also delete the Redis queue data
```

Neither command touches your Signal device link. That data is a bind mount to
`server/signal-cli-config/signal-cli-config/` on your disk, not a Docker volume,
so `-v` leaves it alone. Only deleting that directory loses the link.

`-v` does delete the `redis-data` volume, which drops any queued jobs.
