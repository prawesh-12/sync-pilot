# AGENTS.md

## Prime Directive

If you cannot explain it in one sentence — rebuild it.

---

## Code Rules

* Max file:  **300 lines** . Max function:  **40 lines** . Split if exceeded.
* Max nesting:  **3 levels** . Extract a function if you hit level 4.
* No chained ternaries. Use `if/else`.
* No magic numbers. Name every constant.
* No clever one-liners. Write what you mean.

# Code Emoji Rules:

1. Never embed emojis in code constants, enums, database values, API responses, or logs.
2. Store semantics, not presentation.
3. Use values like:
   - severity: "critical" | "warning" | "info"
   - priority: "high" | "medium" | "low"
   - status: "success" | "error" | "pending"
4. Let the frontend map semantic values to icons, colors, badges, or emojis.
5. Prefer ASCII-only text for titles, labels, and constants.

### Naming

* Variables/functions: `camelCase`
* Classes/components: `PascalCase`
* Constants/env vars: `UPPER_SNAKE_CASE`
* Files: `kebab-case`
* Booleans start with: `is`, `has`, `can`, `should`
* Functions start with a verb: `getUser`, `sendEmail`

### Comments

* Comment  **why** , never  **what** .
* One line only. If you need more — the code is unclear, rewrite it.
* No commented-out dead code. Delete it.
* In commenet never write phase or anything like phase 1 or phase 2, etc

---

## Architecture

* Every file and function does  **one thing** . If you use "and" — split it.
* Group by  **feature** , not by type.
* Max **3 levels** of folder nesting.

```
src/
  features/
    auth/
    emails/
  lib/       ← shared utilities only
  db/        ← schema + queries only
  config/    ← env + constants
```

* No new library unless you truly cannot build it in 30 minutes.

---

## Security (Hard Rules)

* **No secrets in client-side code. Ever.**
* **No secrets in source code.** Use env vars only.
* **Never commit `.env`.** If you did — rotate the secret immediately.
* Every API route must check auth server-side. No exceptions.
* Always use parameterised queries. No string concatenation in SQL.
* Validate all input with Zod before it touches logic or DB.
* Never expose error details, stack traces, or DB info to the client.
* Database ports (Redis 6379, Postgres 5432) must never be public.
* Passwords: use `bcrypt` or `argon2`. Never MD5 or SHA-1.
* Session tokens: `httpOnly` cookies only. Never `localStorage`.
* Add rate limiting on all auth endpoints.
* Check resource ownership on every request (no IDOR).

---

## Error Handling

* No silent failures. Every error must be caught and logged.
* Log: timestamp + user ID + operation + message.
* Send generic message to client. Full error stays on server.
* If a critical step fails — stop. Do not continue silently.

---

## Do Not Do These

* Do not run the app, server, or any process.
* Do not start or stop Docker containers.
* Do not run database migrations.
* Do not execute shell commands that start services.
* Do not run `pnpm dev`, `docker compose up`, or anything similar.

---

## Git Rules

* `.env`, `node_modules`, build files → always in `.gitignore`.

---

## AI Output Rules

* Read every line before accepting. It is a draft, not a solution.
* If you do not understand a line — do not keep it.
* Always check for: hardcoded secrets, missing auth, silent catch blocks, CORS set to `*`.

---

## Before every checks

* [ ] No file over 300 lines
* [ ] No secrets in code or committed `.env`
* [ ] Every route has server-side auth
* [ ] No SQL string concatenation
* [ ] No `localStorage` for tokens
* [ ] Database ports not public
* [ ] `pnpm audit` passed
* [ ] No Docker or server processes started by AI
