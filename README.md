# SyncPilot — AI Agent

SyncPilot is an AI agent for your inbox. It reads every new Gmail message,
**triages what matters**, takes action (summarize, archive, label, escalate,
snooze, or **draft a reply**), and briefs you in the **Signal** messaging app.
You stay in control: reply on Signal to **approve, send, or revise** a draft.

In short:

1. Connect one or more Gmail accounts.
2. Link Signal by scanning a QR code, and save your sender/recipient numbers.
3. On each cron tick, SyncPilot reads new email, the agent decides what to do
   with each one, and the results — summaries and drafts — land in Signal.
4. Reply on Signal with a ref code to confirm, send, or revise a drafted reply.

---

# Architecture
SyncPilot runs as two cooperating pieces:

- **Web app (`web/`, Next.js on Vercel)** — UI, auth, integrations, the agent
  logic (Gmail via Composio, triage via Groq, Signal send/receive), and the
  cron endpoints.
- **Intake server + worker (`server/`, Express + BullMQ + Redis on EC2)** —
  optional scale-out path. The `fetch-emails` cron enqueues one job per Gmail
  account to this worker pool, and each worker calls back into the web app to
  run the agent for that account. With no intake server configured, the cron
  runs accounts inline (fine for local/single-account use).

Signal connectivity is provided by a self-hosted
[signal-cli-rest-api](https://github.com/bbernhard/signal-cli-rest-api)
container running in **native** mode.

---

## What the agent does

On each run, every new email is read and given **one decision**:

| Decision | Meaning |
| --- | --- |
| `summarize_notify` | Condense the email and send a brief to Signal |
| `draft_reply` | Draft a reply and send it to Signal for approval |
| `escalate` | Flag as urgent / needs attention |
| `apply_label` | Apply a Gmail label |
| `archive` | Archive low-value mail |
| `snooze` | Defer for later |
| `ignore` | No action (noise) |

Drafted replies are not sent automatically. SyncPilot sends the draft to Signal
with a short **ref code**; you reply on Signal to **confirm**, **send**, or
**revise** it. A second cron (`poll-signal-replies`) drains those replies and
applies your decision.

---

## Tech Stack

- **Next.js 16 + React 19** (App Router) — web app
- **Auth.js (NextAuth v5)** — Google sign-in
- **Composio** — Gmail connection and actions (`@composio/core`, `@composio/vercel`)
- **Vercel AI SDK + Groq** — triage/summarization (`@ai-sdk/groq`, model `openai/gpt-oss-120b`)
- **Drizzle ORM + PostgreSQL** (Neon in production) — integrations, runs, decisions, billing
- **signal-cli-rest-api** — Signal send/receive (Docker)
- **Express + BullMQ + Redis** (`server/`) — EC2 intake server and worker pool
- **Razorpay** — subscription billing
- **cron-job.org** — external scheduler for the cron endpoints

---

## Project Setup (Locally)

> The web app lives in `web/`; the optional worker lives in `server/`. There is
> no root workspace — run `pnpm` inside the package you're working on.

### 1) Install prerequisites

- Node.js 20 LTS or newer (the `server/` worker targets Node 22)
- pnpm (run `corepack enable`, or see https://pnpm.io/installation)
- PostgreSQL (or a Neon connection string)
- Docker + Docker Compose (for signal-cli)
- A Google Cloud account (for Google sign-in)
- A [Composio](https://composio.dev) account (for Gmail)
- A Groq API key
- Signal app on your phone (for QR linking)

### 2) Clone and install

```bash
git clone https://github.com/prawesh-12/sync-pilot.git
cd sync-pilot/web
pnpm install
```

### 3) Create local environment file

```bash
cp .env.example .env.local
```

Open `.env.local` and fill every required value. The sections below cover each.

### 4) PostgreSQL and `DATABASE_URL`

Start PostgreSQL and create a database, then set `DATABASE_URL`:

```bash
sudo service postgresql start
sudo -u postgres createdb syncpilot
```

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/syncpilot
```

### 5) Auth.js (Google sign-in)

Generate an auth secret and create a Google OAuth client for **login**:

```bash
openssl rand -base64 33   # -> AUTH_SECRET
```

In Google Cloud Console, create an OAuth Client ID (Web application) with:

```text
Authorised redirect URI:
http://localhost:3000/api/auth/callback/google
```

```env
AUTH_SECRET=<generated>
AUTH_GOOGLE_ID=<google-oauth-client-id>
AUTH_GOOGLE_SECRET=<google-oauth-client-secret>
```

### 6) Composio (Gmail)

Gmail access is handled by Composio, not by a direct Google token.

1. Create a Composio account and copy your API key.
2. In the Composio dashboard, create a **Gmail** auth config and copy its ID.

```env
COMPOSIO_API_KEY=<composio-api-key>
COMPOSIO_GMAIL_AUTH_CONFIG_ID=<gmail-auth-config-id>
```

### 7) Encryption key

```bash
openssl rand -hex 32   # 64 hex chars
```

```env
ENCRYPTION_KEY=<paste-generated-hex>
```

### 8) Groq and cron secrets

```env
GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-120b

CRON_SECRET=<any-strong-random-string>
```

### 9) Signal REST service (Docker)

```bash
cd ../server/signal-cli-config
docker compose up -d
cd ../../web
```

```env
SIGNAL_CLI_REST_URL=http://localhost:8080
# Leave SIGNAL_AUTH_TOKEN empty for local; set it in production so the proxy in
# front of signal-cli rejects requests without a matching X-Signal-Auth header.
SIGNAL_AUTH_TOKEN=
```

### 10) Run database migrations

```bash
pnpm db:migrate
```

> Migrations are applied manually — there is **no auto-migrate on deploy**.
> After generating new migrations, run `pnpm db:migrate` against each
> environment (including production) or queries will fail on missing tables.

### 11) Start the app

```bash
pnpm dev
```

Open http://localhost:3000

### 12) First-time in-app setup

1. Sign in with Google.
2. Open **Dashboard → Connection Setting**.
3. Click **Connect Gmail** and complete the Composio flow (repeat to add more
   accounts).
4. Click **Generate Signal QR**.
5. In the Signal mobile app: **Linked Devices → scan QR**.
6. Save sender and recipient phone numbers in E.164 format (e.g. `+919279581041`).

### 13) Trigger the agent manually

```bash
curl -X POST "http://localhost:3000/api/cron/fetch-emails" \
    -H "Authorization: Bearer <CRON_SECRET>"
```

With no `INTAKE_SERVER_URL` set, the run is inline and returns:

```json
{ "mode": "inline", "accountsProcessed": 1, "successfulRuns": 1, "failedRuns": 0, "runs": [ ... ] }
```

With an intake server configured it enqueues instead:

```json
{ "mode": "queued", "accountsQueued": 1 }
```

### 14) Quick troubleshooting

- `401` on a cron route: `CRON_SECRET` mismatch in the `Authorization` header.
- `500` on a cron/worker route: usually unapplied DB migrations (run `pnpm db:migrate`).
- Gmail connect lands on a Composio page: expected — it's the hosted OAuth flow.
- No Signal messages: verify the QR link, sender/recipient numbers, and `SIGNAL_CLI_REST_URL`.
- No emails processed: confirm the signed-in user has both a Gmail account and Signal connected.

---

## Cron jobs

Both routes are protected by `Authorization: Bearer <CRON_SECRET>` and accept
GET or POST. Schedule them externally (this project uses
[cron-job.org](https://cron-job.org)).

| Route | Purpose | Suggested interval |
| --- | --- | --- |
| `/api/cron/fetch-emails` | Read new email → agent triage → summaries/drafts to Signal | every 5–15 min |
| `/api/cron/poll-signal-replies` | Drain Signal replies and apply confirm/send/revise | every 1 min |

For production scheduling on cron-job.org:

- URL: `https://<your-domain>/api/cron/<route>`
- Method: POST
- Header: `Authorization: Bearer <CRON_SECRET>`

If testing from local dev, expose the app publicly (e.g. via a tunnel) so
cron-job.org can reach the endpoints.

---

## Scaling with the EC2 worker (optional)

To fan out across many Gmail accounts, run the `server/` package (Express +
BullMQ + Redis) on a host such as EC2:

1. Set `SYNC_SECRET` (shared with the web app), `WEB_APP_URL`, and
   `REDIS_HOST`/`REDIS_PORT` in `server/.env` (see `server/.env.example`).
2. Bring up Redis + the worker (`server/docker-compose.yml`). When running in
   Docker Compose, `REDIS_HOST` must be the Redis **service name** (e.g.
   `redis`), not `localhost`.
3. In the web app, set `INTAKE_SERVER_URL` to the server's base URL and
   `SYNC_SECRET` to the same value.

The `fetch-emails` cron then enqueues one job per account; each worker calls
`POST /api/agent/run-job` to run the agent and reports lifecycle to
`POST /api/internal/sync-jobs`.

---

## API Endpoints

**Cron (Bearer `CRON_SECRET`)**
- `GET|POST /api/cron/fetch-emails` — read → triage → summaries/drafts to Signal
- `GET|POST /api/cron/poll-signal-replies` — drain and apply Signal replies

**Auth & integrations**
- `GET|POST /api/auth/[...nextauth]` — Auth.js (Google sign-in)
- `GET /api/auth/status` — current auth/integration status
- `GET /api/auth/composio` — start the Gmail connect flow
- `GET /api/auth/composio/callback` — finish Gmail connect and store the account
- `GET /api/signal/qr` — QR image from signal-cli for linking Signal

**Agent (machine-authenticated with `SYNC_SECRET` via `x-secret`)**
- `POST /api/agent/run` — manual agent task (session-authenticated)
- `POST /api/agent/run-job` — run the agent for one account (called by the worker)
- `POST /api/internal/sync-jobs` — durable job-status sink (called by the worker)

**Billing**
- `POST /api/billing/subscribe` — create a Razorpay subscription
- `POST /api/webhooks/razorpay` — Razorpay webhook (signature-verified)

---

## Notes

- The agent runs only for users who have both Gmail and Signal connected.
- Multiple Gmail accounts per user are supported; each is one job/run.
- Drafted replies require explicit Signal confirmation before being sent.
- Run history and per-email decisions are stored and shown on the Dashboard.

---

## License

MIT — see [`LICENSE`](./LICENSE)

---
