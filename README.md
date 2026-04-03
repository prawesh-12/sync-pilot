## SyncPilot

SyncPilot is a protected Next.js operator console with Clerk authentication and
an AI action panel backed by Cerebras' OpenAI-compatible inference API.

The current implementation includes:

- Public landing page plus Clerk sign-in and sign-up routes
- Middleware-protected dashboard
- Server-side `/api/agent/run` route
- Structured SyncPilot agent runs using `gpt-oss-120b` on Cerebras
- Dashboard UI for inbox triage, scheduling briefs, and general operations runs

## Getting Started

1. Install dependencies.

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CEREBRAS_API_KEY`

Optional variables:

- `CEREBRAS_MODEL` default `gpt-oss-120b`
- `CEREBRAS_BASE_URL` default `https://api.cerebras.ai/v1`

3. Run the development server.

```bash
npm run dev
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
- Cerebras Inference API with OpenAI-compatible chat completions

Official Cerebras docs: https://inference-docs.cerebras.ai/
