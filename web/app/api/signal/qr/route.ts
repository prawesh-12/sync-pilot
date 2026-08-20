import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildSignalDeviceName, getSignalQrCodeLink } from "@/features/signal/signal";
import { getSignalIntegration } from "@/db/queries";
import { getSignalAuthHeaders } from "@/config/env";
import { scopedLogger } from "@/lib/logger";

const SIGNAL_QR_TIMEOUT_MS = 15_000;

const log = scopedLogger("SIGNAL");

export async function GET() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    try {
        const signalIntegration = await getSignalIntegration(userId);
        const deviceName =
            signalIntegration?.deviceName || buildSignalDeviceName(userId);
        const endpoint = getSignalQrCodeLink(deviceName);
        const upstreamResponse = await fetch(endpoint, {
            headers: getSignalAuthHeaders(),
            cache: "no-store",
            signal: AbortSignal.timeout(SIGNAL_QR_TIMEOUT_MS),
        });

        if (!upstreamResponse.ok) {
            const upstreamError = await upstreamResponse.text().catch(() => "");

            log.error(
                {
                    userId,
                    deviceName,
                    statusCode: upstreamResponse.status,
                    reason: upstreamError,
                },
                "signal QR request failed",
            );

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

        log.info(
            { userId, deviceName, bytes: body.byteLength },
            "signal QR served",
        );

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

        log.error({ userId, err: error }, "signal QR could not be loaded");

        return NextResponse.json(
            {
                error: message,
            },
            { status: 500 },
        );
    }
}
