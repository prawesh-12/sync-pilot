import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getConnectedGmailAddress } from "@/lib/agent/gmail";
import { disconnectGmailIntegration, getIntegration } from "@/lib/db/queries";

type SettingsPageProps = {
    searchParams: Promise<{
        gmail?: string | string[];
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
    const integration = await getIntegration(userId);
    const isConnected = Boolean(integration);
    let connectedGmailAddress: string | null = null;

    if (integration) {
        try {
            connectedGmailAddress = await getConnectedGmailAddress({
                accessTokenEncrypted: integration.accessTokenEncrypted,
                refreshTokenEncrypted: integration.refreshTokenEncrypted,
            });
        } catch (error) {
            console.error("[SETTINGS] Failed to resolve connected Gmail address");
            console.error(error);
        }
    }

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

    const disconnectedBanner = gmailStatus === "disconnected" ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Gmail integration disconnected.
        </div>
    ) : null;

    const settingsCard = (
        <Card className="border-border/80 bg-card/80">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                    <CardDescription>
                        Connect or disconnect Gmail for the email summary pipeline.
                    </CardDescription>
                </div>

                {isConnected ? (
                    <>
                        <div className="flex items-center gap-2">
                            <Badge variant="default">Connected </Badge> {connectedGmailAddress || "Unable to load Gmail address"}
                        </div>
                    </>
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

    if (variant === "popup") {
        return (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
                {disconnectedBanner}
                {settingsCard}
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
            {settingsCard}
        </main>
    );
}
