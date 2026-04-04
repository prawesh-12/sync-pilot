import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildSignalDeviceName, getSignalQrCodeLink } from "@/lib/agent/signal";
import { getSignalIntegration } from "@/lib/db/queries";

const SIGNAL_QR_TIMEOUT_MS = 15_000;

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    try {
        const signalIntegration = await getSignalIntegration(userId);
        const deviceName =
            signalIntegration?.deviceName || buildSignalDeviceName(userId);
        const endpoint = getSignalQrCodeLink(deviceName);
        const upstreamResponse = await fetch(endpoint, {
            cache: "no-store",
            signal: AbortSignal.timeout(SIGNAL_QR_TIMEOUT_MS),
        });

        if (!upstreamResponse.ok) {
            const upstreamError = await upstreamResponse.text().catch(() => "");

            return NextResponse.json(
                {
                    error:
                        upstreamError ||
                        `Signal QR request failed with status ${upstreamResponse.status}.`,
                },
                { status: 502 },
            );
        }

        const body = await upstreamResponse.arrayBuffer();
        const headers = new Headers({
            "Cache-Control": "no-store",
        });
        const contentType = upstreamResponse.headers.get("content-type");

        if (contentType) {
            headers.set("Content-Type", contentType);
        }

        return new NextResponse(body, {
            status: 200,
            headers,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to load Signal QR.";

        return NextResponse.json(
            {
                error: message,
            },
            { status: 500 },
        );
    }
}
