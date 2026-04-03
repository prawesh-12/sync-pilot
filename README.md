## SyncPilot

SyncPilot is a protected Next.js operator console with Clerk authentication and
an AI action panel backed by Groq.

The current implementation includes:

- Public landing page plus Clerk sign-in and sign-up routes
- Middleware-protected dashboard
- Server-side `/api/agent/run` route
- Structured SyncPilot agent runs using `openai/gpt-oss-120b` on Groq
- Signal delivery helper for summary notifications via `signal-cli-rest-api`
- Dashboard UI for inbox triage, scheduling briefs, and general operations runs

## Getting Started

1. Install dependencies.

```bash
bun install
```

2. Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `GROQ_API_KEY`

Optional variables:

- `GROQ_MODEL` default `openai/gpt-oss-120b`
- `SIGNAL_CLI_REST_URL`
- `SIGNAL_SENDER_NUMBER`
- `SIGNAL_RECIPIENT_NUMBER`

3. Run the development server.

```bash
bun run dev
```

4. Open `http://localhost:3000`, create an account, and go to `/dashboard`.

## AI Route

`POST /api/agent/run`

Authenticated route that accepts:

```json
{
  "workflow": "operations_copilot",
  "task": "Summarize this vendor thread and recommend the next steps.",
  "context": "Raw notes, email thread, or scheduling context"
}
```

The route returns a structured JSON brief with:

- `headline`
- `summary`
- `recommendedActions`
- `suggestedTags`
- `draftReply`
- `missingInformation`
- `riskLevel`
- `automationReadiness`
- `confidence`

## Signal Delivery

`lib/agent/signal.ts` sends a formatted message to a reachable
`signal-cli-rest-api` service using `POST /v1/send`.

Expected environment variables:

- `SIGNAL_CLI_REST_URL`
- `SIGNAL_SENDER_NUMBER`
- `SIGNAL_RECIPIENT_NUMBER`

The helper returns `{ ok, error?, statusCode? }` so cron or orchestration code
can log failures without crashing the whole run.

## Current Scope

This repo does not yet implement:

- Google Calendar or Gmail API integrations
- Drizzle ORM models or persisted task runs
- Webhook ingestion
- Cron-driven autonomous runs

Those are the next logical slices after the provider-backed agent path is stable.

## References

- Next.js App Router
- Clerk Next.js SDK
- Groq API
