import { NextResponse } from "next/server";
import { z } from "zod";
import { recordSyncJobEvent } from "@/db/queries";
import { SYNC_JOB_STATUS_VALUES } from "@/db/schema";
import { getSyncSecret } from "@/config/env";
import { secureEquals } from "@/lib/secure-compare";
import { scopedLogger } from "@/lib/logger";

export const runtime = "nodejs";

const SYNC_SECRET_HEADER = "x-secret";
const log = scopedLogger("INTERNAL");

// The EC2 worker reports queued-job lifecycle here so job status is durable in
// Postgres (beyond Redis retention). Authenticated with the shared SYNC_SECRET.
const eventSchema = z.object({
  bullJobId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  integrationId: z.string().trim().min(1),
  status: z.enum(SYNC_JOB_STATUS_VALUES),
  attempts: z.number().int().nonnegative().optional(),
  error: z.string().nullish(),
});

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });
  }

  try {
    await recordSyncJobEvent(parsed.data);

    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error(
      { bullJobId: parsed.data.bullJobId, err: String(error) },
      "sync-jobs status write failed",
    );

    return NextResponse.json({ error: "Status write failed." }, { status: 500 });
  }
}

function isAuthorized(request: Request) {
  try {
    const provided = request.headers.get(SYNC_SECRET_HEADER);
    const expected = getSyncSecret();

    if (!provided || !expected) {
      return false;
    }

    return secureEquals(provided, expected);
  } catch {
    return false;
  }
}
