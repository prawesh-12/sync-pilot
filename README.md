# SyncPilot - Ai Agent

SyncPilot is an Ai Agent for email that reads new Gmail messages, summarizes them,
and sends the summary to Signal messaging application.

In short:

1. User connects Gmail.
2. User links Signal and saves sender/recipient numbers.
3. SyncPilot fetches new emails, summarizes them with AI, and delivers results to Signal.

---

# Previews

<img src="./public/previews/landing_page.png" alt="Landing Page"/>

<img src="./public/previews/Dashboard_page.png" alt="Dashboard Page"/>

<img src="./public/previews/connection_setting_pop_up.png" alt="Connection Setting Pop Up"/>

<img style="width:200px" src="./public/previews/mobile_signal_app_preview.jpeg" alt="Signal App preview"/>

---

## Core Workflow

1. Authenticate with Clerk.
2. Connect Gmail using Google OAuth.
3. Connect Signal by scanning a QR code (Linked Devices in Signal).
4. Save Signal sender and recipient numbers (E.164 format, for example +914155550123).
5. Trigger the cron endpoint (or schedule it externally). Cron time is like 9:00 AM to 9:15AM all the received email will be one by summarised and sent to the signal application next from 9:15AM to 9:30AM. every 15 minutes.
6. New Gmail emails are summarized with Groq and sent to Signal Application.

---

## Implementation

- Next.js App Router UI with protected dashboard
- Clerk authentication (sign-in and sign-up)
- Gmail read access via Google OAuth
- Signal integration via signal-cli-rest-api
- AI summarization with Groq model openai/gpt-oss-120b
- Per-user integration state and run history stored in PostgreSQL (Drizzle)
- Authenticated manual agent route for structured operations briefs

---

## Tech Stack

- Next.js 16 + React 19
- Clerk - Authentication
- Drizzle ORM + PostgreSQL
- Google APIs (Gmail)
- Vercel AI SDK + Groq
- [signal-cli-rest-api](https://github.com/bbernhard/signal-cli-rest-api)
- for cron jobs https://cron-job.org/en/ used.

---

## Project Setup (Locally)

### 1) Install prerequisites

- Bun
- PostgreSQL
- Docker + Docker Compose
- A Clerk account
- A Google Cloud account
- A Groq API key
- Signal app on your phone (for QR linking)

### 2) Clone project and install dependencies

```bash
git clone https://github.com/prawesh-12/sync-pilot.git
cd sync-pilot
bun install
```

### 3) Create local environment file

```bash
cp .env.example .env.local
```

Open .env.local and fill every required value.

### 4) Setup PostgreSQL and DATABASE_URL

Start PostgreSQL service, then create a database.

Example (Linux):

```bash
sudo service postgresql start
sudo -u postgres createdb syncpilot
```

Set DATABASE_URL in .env.local, for example:

```env
DATABASE_URL=postgresql://postgres:postgres@username:password/syncpilot
```

Use your real postgres username/password if different.

### 5) Setup Clerk keys

1. Create a Clerk application at https://clerk.com.
2. Copy keys from Clerk dashboard.
3. Set these in .env.local:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

### 6) Setup Google OAuth for Gmail API

In Google Cloud Console:

1. Create/select a project.
2. Enable Gmail API.
3. Configure OAuth consent screen.
4. Add [test users](https://console.cloud.google.com/auth/audience).
   Add the email addresses that are allowed to test Gmail summary access.
5. Go to [/auth/clients](https://console.cloud.google.com/auth/clients) and create an OAuth Client ID of type Web application.
6. Set these values exactly in the OAuth client:

```text
Authorised JavaScript origins:
http://localhost:3000

Authorised redirect URIs:
http://localhost:3000/api/auth/google/callback
```

Set these in .env.local:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

7. Save the OAuth client and use the copied credentials.

Important: GOOGLE_REDIRECT_URI must exactly match the redirect URI configured above.

### 7) Set ENCRYPTION_KEY correctly

Generate a 64 character hex key using below cmd or use any website to generate :

```bash
openssl rand -hex 32
```

Set it in .env.local:

```env
ENCRYPTION_KEY=<paste-generated-hex>
```

### 8) Set Groq and Cron secrets

```env
GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-120b

CRON_SECRET=<any-strong-random-string>
```

### 9) Start Signal REST service (docker)

From project root:

```bash
cd signal-cli-config
docker compose up -d
cd ..
```

Set in .env.local:

```env
SIGNAL_CLI_REST_URL=http://localhost:8080
```

### 10) Run database migrations

```bash
bun run db:migrate
```

### 11) Start the app

```bash
bun run dev
```

### Open http://localhost:3000

### 12) First-time in-app setup

1. Sign in.
2. Open Dashboard -> Connection Setting.
3. Click Connect Google Account and complete OAuth.
4. Click Generate Signal QR.
5. In Signal mobile app: Linked Devices -> scan QR.
6. Save sender and recipient phone numbers in E.164 format (example: +911555501230).

### 13) Test cron endpoint manually

```bash
curl -X POST "http://localhost:3000/api/cron/fetch-emails" \
    -H "Authorization: Bearer <CRON_SECRET>"
```

If setup is correct, you will get JSON with values like usersProcessed, successfulRuns, and failedRuns.

### 14) Quick troubleshooting

- 401 on cron route: CRON_SECRET mismatch in header.
- Google callback error: redirect URI must match exactly.
- Encryption errors: ENCRYPTION_KEY must be 64 hex characters.
- No Signal messages: verify Signal QR link, sender/recipient numbers, and SIGNAL_CLI_REST_URL.
- No emails summarized: verify Gmail connection exists for that signed-in user.

---

## Connect Gmail and Signal

- Complete [12) First-time in-app setup](#12-first-time-in-app-setup).

- After this, the user is ready to receive email summaries on Signal.

---

## Trigger Email Processing

1. [Run the cron route local](#13-test-cron-endpoint-manually).

2. For production scheduling, this project uses cron-job.org:

- Dashboard: https://console.cron-job.org/dashboard
- URL: https://<your-domain>/api/cron/fetch-emails
- Method: POST
- Header: Authorization: Bearer <CRON_SECRET>
- Recommended interval: every 5-15 minutes

If you test from local development, expose your local app publicly first
(for example via a tunnel) so cron-job.org can reach the endpoint.

The route processes users who have both Gmail and Signal connected, then
returns summary stats like:

- usersProcessed
- usersSkippedMissingSignal
- successfulRuns
- failedRuns

---

## API Endpoints

- POST /api/agent/run
    - Protected route for manual agent tasks (operations copilot, triage, etc.)
- GET /api/auth/google
    - Starts Google OAuth flow
- GET /api/auth/google/callback
    - Completes OAuth and stores encrypted Gmail tokens
- GET /api/signal/qr
    - Returns QR image from signal-cli-rest-api for linking Signal
- GET or POST /api/cron/fetch-emails
    - Protected by Authorization: Bearer <CRON_SECRET>
    - Runs Gmail fetch -> AI summarize -> Signal send pipeline

---

## Notes

- The cron pipeline sends summaries only for users with both integrations.
- Gmail scope is read-only.
- Signal numbers are saved per user from Settings.
- Agent run history is stored and shown on Dashboard.

---
