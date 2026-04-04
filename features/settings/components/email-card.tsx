import { Suspense } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConnectedEmailDetails } from "./connected-email-details";
import { type getIntegration } from "@/db/queries";

type EmailIntegrationCardProps = {
    isConnected: boolean;
    integration: NonNullable<Awaited<ReturnType<typeof getIntegration>>> | null;
    disconnectAction: () => Promise<void>;
};

export function EmailIntegrationCard({ isConnected, integration, disconnectAction }: EmailIntegrationCardProps) {
    return (
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
                        <form action={disconnectAction}>
                            <Button type="submit" variant="destructive">
                                Disconnect Email
                            </Button>
                        </form>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
