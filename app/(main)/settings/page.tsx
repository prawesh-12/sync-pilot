import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SignalQrModal } from "@/components/dashboard/signal-qr-modal";
import {
    buildSignalDeviceName,
} from "@/lib/agent/signal";
import { isSignalConfigured } from "@/lib/env";
import { getConnectedGmailAddress } from "@/lib/agent/gmail";
import {
    disconnectGmailIntegration,
    disconnectSignalIntegration,
    getIntegration,
    getSignalIntegration,
    upsertSignalIntegration,
    upsertUser,
} from "@/lib/db/queries";

const PHONE_NUMBER_PATTERN = /^\+\d{8,15}$/;

type SettingsPageProps = {
    searchParams: Promise<{
        gmail?: string | string[];
        signal?: string | string[];
        signalError?: string | string[];
    }>;
    variant?: "page" | "popup";
};

export default async function SettingsPage({
    searchParams,
    variant = "page",
}: SettingsPageProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const params = await searchParams;
    const gmailStatus = Array.isArray(params.gmail) ? params.gmail[0] : params.gmail;
    const signalStatus = Array.isArray(params.signal)
        ? params.signal[0]
        : params.signal;
    const signalError = Array.isArray(params.signalError)
        ? params.signalError[0]
        : params.signalError;
    const integration = await getIntegration(userId);
    const signalIntegration = await getSignalIntegration(userId);
    const isConnected = Boolean(integration);
    const isSignalConnected = Boolean(signalIntegration);
    const isSignalServiceConfigured = isSignalConfigured();
    const signalDeviceName = signalIntegration?.deviceName || buildSignalDeviceName(userId);
    const senderNumber = signalIntegration?.senderNumber || "";
    const recipientNumber = signalIntegration?.recipientNumber || "";
    // We remove the slow synchronous getConnectedGmailAddress call from the main page body
    // to prevent the entire Settings popup from stalling. It is now handled asynchronously
    // inside the ConnectedEmailDetails component below.

    async function disconnectGoogleAction() {
        "use server";

        const { userId: actionUserId } = await auth();

        if (!actionUserId) {
            redirect("/sign-in");
        }

        await disconnectGmailIntegration(actionUserId);
        revalidatePath("/dashboard");
        revalidatePath("/settings");

        if (variant === "popup") {
            redirect("/dashboard?settings=open&gmail=disconnected");
        }

        redirect("/settings?gmail=disconnected");
    }

    async function saveSignalIntegrationAction(formData: FormData) {
        "use server";

        const { userId: actionUserId } = await auth();

        if (!actionUserId) {
            redirect("/sign-in");
        }

        const user = await currentUser();
        const email =
            user?.primaryEmailAddress?.emailAddress ||
            user?.emailAddresses[0]?.emailAddress;

        if (!email) {
            redirect(buildSignalSettingsUrl(variant, "failed", "Missing Clerk email."));
        }

        const senderNumberValue = normalizePhoneNumber(
            formData.get("senderNumber"),
        );
        const recipientNumberValue = normalizePhoneNumber(
            formData.get("recipientNumber"),
        );

        if (!isValidPhoneNumber(senderNumberValue)) {
            redirect(
                buildSignalSettingsUrl(
                    variant,
                    "failed",
                    "Sender number must be in E.164 format (example: +14155550123).",
                ),
            );
        }

        if (!isValidPhoneNumber(recipientNumberValue)) {
            redirect(
                buildSignalSettingsUrl(
                    variant,
                    "failed",
                    "Recipient number must be in E.164 format (example: +14155550123).",
                ),
            );
        }

        await upsertUser({ id: actionUserId, email });
        await upsertSignalIntegration(actionUserId, {
            deviceName: signalDeviceName,
            senderNumber: senderNumberValue,
            recipientNumber: recipientNumberValue,
        });

        revalidatePath("/dashboard");
        revalidatePath("/settings");
        redirect(buildSignalSettingsUrl(variant, "saved"));
    }

    async function disconnectSignalAction() {
        "use server";

        const { userId: actionUserId } = await auth();

        if (!actionUserId) {
            redirect("/sign-in");
        }

        await disconnectSignalIntegration(actionUserId);
        revalidatePath("/dashboard");
        revalidatePath("/settings");
        redirect(buildSignalSettingsUrl(variant, "disconnected"));
    }

    const disconnectedBanner = gmailStatus === "disconnected" ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Gmail integration disconnected.
        </div>
    ) : null;

    const signalSavedBanner = signalStatus === "saved" ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Signal integration saved.
        </div>
    ) : null;

    const signalDisconnectedBanner = signalStatus === "disconnected" ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Signal integration disconnected.
        </div>
    ) : null;

    const signalFailedBanner = signalStatus === "failed" ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Failed to save Signal integration.
            {signalError ? ` ${signalError}` : ""}
        </div>
    ) : null;

    const settingsCard = (
        <Card className="border-emerald-500/20 bg-emerald-500/3">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                    <CardTitle className="text-base">Email Integration</CardTitle>
                </div>

                {isConnected && integration ? (
                    <div className="flex items-center gap-2">
                        <Badge variant="default">Connected</Badge> 
                        <Suspense fallback={<Skeleton width="150px" height="20px" />}>
                            <ConnectedEmailDetails integration={integration} />
                        </Suspense>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Not connected</Badge>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    {!isConnected ? (
                        <Button asChild>
                            <Link href="/api/auth/google">Connect Google Account</Link>
                        </Button>
                    ) : (
                        <form action={disconnectGoogleAction}>
                            <Button type="submit" variant="destructive">
                                Disconnect Email
                            </Button>
                        </form>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const signalCard = (
        <Card className="border-[#A089E6]/30 bg-[#A089E6]/3">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-2">
                    <CardTitle className="text-base">Signal Integration</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Device name: {signalDeviceName}
                    </p>
                </div>

                {isSignalConnected ? (
                    <div className="flex items-center gap-2">
                        <Badge variant="default">Connected</Badge>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Not connected</Badge>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {isSignalServiceConfigured ? (
                    <SignalQrModal />
                ) : (
                    <p className="text-xs text-red-300">
                        SIGNAL_CLI_REST_URL is missing. Add it to your environment first.
                    </p>
                )}

                <form action={saveSignalIntegrationAction} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label
                                htmlFor="senderNumber"
                                className="text-xs text-muted-foreground"
                            >
                                Sender Number
                            </label>
                            <Input
                                id="senderNumber"
                                name="senderNumber"
                                placeholder="+910000000000"
                                defaultValue={senderNumber}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="recipientNumber"
                                className="text-xs text-muted-foreground"
                            >
                                Recipient Number
                            </label>
                            <Input
                                id="recipientNumber"
                                name="recipientNumber"
                                placeholder="+910000000000"
                                defaultValue={recipientNumber}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button type="submit">Save Signal Numbers</Button>
                    </div>
                </form>

                {isSignalConnected ? (
                    <form action={disconnectSignalAction}>
                        <Button type="submit" variant="destructive">
                            Disconnect Signal
                        </Button>
                    </form>
                ) : null}
            </CardContent>
        </Card>
    );

    const emailSection = (
        <section className="space-y-2">
            {settingsCard}
        </section>
    );

    const signalSection = (
        <section className="space-y-2">
            {signalCard}
        </section>
    );

    if (variant === "popup") {
        return (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
                {disconnectedBanner}
                {signalSavedBanner}
                {signalDisconnectedBanner}
                {signalFailedBanner}
                {emailSection}
                {signalSection}
            </div>
        );
    }

    return (
        <main className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
            <section className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage connected integrations.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard">Back to dashboard</Link>
                </Button>
            </section>

            {disconnectedBanner}
            {signalSavedBanner}
            {signalDisconnectedBanner}
            {signalFailedBanner}
            {emailSection}
            {signalSection}
        </main>
    );
}

function normalizePhoneNumber(value: FormDataEntryValue | null) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().replace(/\s+/g, "");
}

function isValidPhoneNumber(value: string) {
    return PHONE_NUMBER_PATTERN.test(value);
}

function buildSignalSettingsUrl(
    variant: SettingsPageProps["variant"],
    signalStatus: "saved" | "failed" | "disconnected",
    signalError?: string,
) {
    const basePath = variant === "popup" ? "/dashboard?settings=open" : "/settings";
    const querySeparator = basePath.includes("?") ? "&" : "?";
    let url = `${basePath}${querySeparator}signal=${signalStatus}`;

    if (signalError) {
        url += `&signalError=${encodeURIComponent(signalError)}`;
    }

    return url;
}

async function ConnectedEmailDetails({ integration }: { integration: NonNullable<Awaited<ReturnType<typeof getIntegration>>> }) {
    let email: string | null = null;
    try {
        email = await getConnectedGmailAddress({
            accessTokenEncrypted: integration.accessTokenEncrypted,
            refreshTokenEncrypted: integration.refreshTokenEncrypted,
        });
    } catch (error) {
        console.error("[SETTINGS] Failed to resolve connected Gmail address");
        console.error(error);
    }

    return <span>{email || "Unable to load Gmail address"}</span>;
}
