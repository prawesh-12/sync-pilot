import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgent } from "@/features/agent/run-agent";
import { getSyncSecret } from "@/config/env";

export const preferredRegion = "sin1";
// One job processes a whole Gmail account, so allow a long execution window.
export const maxDuration = 300;

const SYNC_SECRET_HEADER = "x-secret";

const jobSchema = z.object({
    userId: z.string().trim().min(1),
    integrationId: z.string().trim().min(1),
});

// Runs the agent for a single Gmail account on behalf of the EC2 worker, which
// authenticates with the shared SYNC_SECRET.
export async function POST(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => null);
    const parsed = jobSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid job payload." },
            { status: 400 },
        );
    }

    try {
        const summary = await runAgent(
            parsed.data.userId,
            parsed.data.integrationId,
        );

        return NextResponse.json(summary);
    } catch (error) {
        console.error("[AGENT_API] run-job failed");
        console.error(error);

        return NextResponse.json(
            { error: "Agent run failed." },
            { status: 500 },
        );
    }
}

function isAuthorized(request: Request) {
    try {
        return request.headers.get(SYNC_SECRET_HEADER) === getSyncSecret();
    } catch {
        // SYNC_SECRET not configured; treat as unauthorized rather than crash.
        return false;
    }
}
