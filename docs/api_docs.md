# API reference

All routes live in `web/app/api/` and run on Vercel. The Lightsail server
exposes three more, listed at the end.

There is no public API. Every route is called by one of four callers: the
browser session, the external scheduler, the queue worker, or Razorpay.

## Authentication

Four different schemes, one per caller. There is no shared middleware; each
route checks its own.

| Scheme | Header | Used by | Checked with |
| --- | --- | --- | --- |
| Session | cookie | Browser | `auth()` from Auth.js |
| Cron secret | `Authorization: Bearer <CRON_SECRET>` | cron-job.org | `secureEquals` |
| Sync secret | `x-secret: <SYNC_SECRET>` | Queue worker, intake server | `secureEquals` |
| Webhook signature | `x-razorpay-signature` | Razorpay | HMAC SHA256 |

`secureEquals` (`web/lib/secure-compare.ts`) is a constant time comparison. A
plain `===` leaks secret length and content through timing.

Every secret compare treats a missing or unconfigured secret as unauthorized
rather than throwing, so a misconfigured deploy returns 401 instead of 500.

---

## Cron routes

Called by an external scheduler. Both accept `GET` and `POST` because scheduler
services vary in what they send.

### `GET|POST /api/cron/fetch-emails`

Reads new mail for every eligible Gmail account and acts on it.

**Auth:** `Authorization: Bearer <CRON_SECRET>`
**Timeout:** `maxDuration = 300`, region `sin1`

An account is eligible only if its user has **both** a Gmail integration and a
Signal integration. Accounts without both are skipped silently.

The route has two modes, chosen by whether `INTAKE_SERVER_URL` is set:

| Mode | When | Behaviour |
| --- | --- | --- |
| `queued` | `INTAKE_SERVER_URL` set | Posts all jobs to the intake server and returns immediately |
| `inline` | `INTAKE_SERVER_URL` blank | Runs each account in the request itself |

Queued response:

```json
{ "mode": "queued", "accountsQueued": 3 }
```

Inline response:

```json
{
  "mode": "inline",
  "accountsProcessed": 1,
  "successfulRuns": 1,
  "failedRuns": 0,
  "runs": [
    {
      "userId": "...",
      "integrationId": "...",
      "emailsFound": 4,
      "summariesSent": 2,
      "status": "success",
      "totalTokens": 8123
    }
  ]
}
```

| Status | Meaning |
| --- | --- |
| 200 | Ran. `accountsQueued: 0` is normal and means nothing was eligible |
| 401 | Bad or missing `CRON_SECRET` |
| 500 | Handler threw. Most often the intake server returned non 2xx, which usually means a `SYNC_SECRET` mismatch or a stale `INTAKE_SERVER_URL` |

Before collecting jobs the route calls `expireStalePendingActions()`, so old
unanswered drafts are cleaned up on the same tick.

### `GET|POST /api/cron/poll-signal-replies`

Drains Signal replies and applies them.

**Auth:** `Authorization: Bearer <CRON_SECRET>`
**Timeout:** `maxDuration = 60`, region `sin1`

```json
{ "usersPolled": 1, "repliesHandled": 2 }
```

This route only polls users who have a pending draft waiting. Polling every
user would create lock contention inside signal-cli, and duplicate Signal
numbers are removed before polling for the same reason.

Reply grammar is a 4 character ref code followed by a command:

| Reply | Parsed as |
| --- | --- |
| `A3X9 send`, `A3X9 yes` | `draft_send` |
| `A3X9 no`, `A3X9 discard` | `draft_discard` |
| `A3X9 make it shorter` | `draft_revise` with those instructions |
| `A3X9` | `ref_usage`, replies with help text |
| No valid ref code | Ignored |

Ref codes are 4 characters from `ABCDEFGHJKMNPQRSTUVWXYZ23456789`. That
alphabet drops `I`, `L`, `O`, `0` and `1`, which are the characters people
mistype when reading a code off a phone screen.

---

## Internal routes

Called by the queue worker on the Lightsail box, not by a browser.

### `POST /api/agent/run-job`

Runs the agent for one Gmail account. This is where the real work happens: the
worker does not run the agent itself, it calls back here.

**Auth:** `x-secret: <SYNC_SECRET>`
**Timeout:** `maxDuration = 300`, region `sin1`

Request:

```json
{ "userId": "uuid", "integrationId": "uuid" }
```

Both fields are validated with Zod and must be non empty strings.

Response is an `AgentRunSummary`:

```json
{ "emailsFound": 4, "summariesSent": 2, "status": "success", "totalTokens": 8123 }
```

| Status | Meaning |
| --- | --- |
| 200 | Run finished |
| 400 | Payload failed schema validation |
| 401 | Bad or missing `SYNC_SECRET` |
| 500 | Run threw. The worker retries, so this is not final |

### `POST /api/internal/sync-jobs`

Records queue job lifecycle in Postgres. Redis trims completed jobs to the last
100 and failures to the last 500, so job history would disappear. This route
makes it durable.

**Auth:** `x-secret: <SYNC_SECRET>`

```json
{
  "bullJobId": "42",
  "userId": "uuid",
  "integrationId": "uuid",
  "status": "completed",
  "attempts": 1,
  "error": null
}
```

`status` is one of the values in `SYNC_JOB_STATUS_VALUES`: `enqueued`,
`active`, `completed`, `failed`, `dead`.

`failed` and `dead` are different. BullMQ fires its failed event on every
attempt, so the worker reports `failed` for a retry and `dead` only once the
job has used its final attempt.

Returns `{ "ok": true }`, or 400 on schema failure, 401 on bad secret, 500 on
write failure.

---

## Session routes

Require a signed in browser session. All return 401 without one.

### `POST /api/agent/run`

Runs the standalone agent console on the dashboard. Not part of the email
pipeline.

```json
{ "workflow": "operations_copilot", "task": "...", "context": "..." }
```

Limits: `task` must be at least 12 characters, `task` at most 4000, `context`
at most 12000, output capped at 500 tokens.

```json
{ "result": { }, "usage": { }, "workflow": "operations_copilot", "provider": "groq" }
```

Returns 400 if the task is too short or the input too large.

### `GET /api/auth/status`

```json
{ "signedIn": true }
```

### `GET /api/auth/composio`

Starts the Gmail connection. Redirects to Composio's OAuth URL. Returns 502 if
Composio does not return a redirect URL.

### `GET /api/auth/composio/callback`

Composio returns here after the user grants Gmail access. Redirects back into
the app.

### `GET /api/signal/qr`

Proxies the signal-cli QR image so the browser never talks to signal-cli
directly. Returns the raw image bytes with `Cache-Control: no-store`.

Times out after 15 seconds. Returns 502 if signal-cli responds with an error,
500 on anything else.

### `POST /api/billing/subscribe`

Creates a Razorpay subscription and records intent.

```json
{ "subscriptionId": "sub_...", "shortUrl": "https://rzp.io/..." }
```

The user's plan is **not** upgraded here. It flips to `pro` only when the
webhook confirms payment. Trusting the client to report its own payment would
be the obvious hole.

---

## Webhook

### `POST /api/webhooks/razorpay`

**Auth:** HMAC SHA256 signature in `x-razorpay-signature`, verified against the
raw body before parsing.

Duplicates are handled with the `x-razorpay-event-id` header and a
`processed_webhook_events` table. A repeat delivery returns:

```json
{ "ok": true, "duplicate": true }
```

Payment providers retry, so a webhook that is not idempotent will double apply.

| Status | Meaning |
| --- | --- |
| 200 | Processed, or already seen |
| 401 | Signature check failed |
| 500 | Processing threw |

---

## Server routes (Lightsail)

Served by `server/server.ts` behind nginx. Only reachable through port 80;
Express itself binds to `127.0.0.1:3001`.

### `GET /health`

```json
{ "ok": true }
```

**This endpoint does not check Redis.** It returns ok when the queue is
completely unreachable. Do not use it as a real health check. To actually
verify the stack, check the nginx access log for `POST /sync` returning 200 and
confirm the completed count in Redis is rising.

### `POST /sync`

**Auth:** `x-secret: <SYNC_SECRET>`

```json
{ "jobs": [{ "userId": "uuid", "integrationId": "uuid" }] }
```

Malformed entries are filtered out rather than rejecting the batch. One
BullMQ job is added per entry.

```json
{ "ok": true, "enqueued": 3 }
```

An empty `jobs` array returns `enqueued: 0` with a 200. Combined with the
`/health` behaviour above, this means a completely broken queue can still pass
both checks.

Job options: 3 attempts, exponential backoff starting at 5s, keep the last 100
completed and last 500 failed.

Returns 401 on bad secret, 500 if the enqueue fails.

### `GET /admin/queues`

Bull Board dashboard, behind HTTP basic auth.

Only mounted when both `QUEUE_DASHBOARD_USER` and `QUEUE_DASHBOARD_PASSWORD`
are set. If either is missing the route does not exist at all, so it cannot be
exposed unauthenticated by accident. The server logs a warning at startup when
it skips mounting.

This page reads Redis to render, which makes it the most useful liveness check
in the system.
