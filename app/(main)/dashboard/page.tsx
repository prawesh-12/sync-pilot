import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
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
import { getIntegration, getRecentAgentRuns } from "@/lib/db/queries";

type DashboardPageProps = {
  searchParams: Promise<{
    gmail?: string | string[];
    gmailError?: string | string[];
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const integration = await getIntegration(userId);
  const recentRuns = await getRecentAgentRuns(userId, 10);
  const isConnected = Boolean(integration);
  const gmailStatus = Array.isArray(params.gmail) ? params.gmail[0] : params.gmail;
  const gmailError = Array.isArray(params.gmailError)
    ? params.gmailError[0]
    : params.gmailError;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor Gmail connection status and recent SyncPilot runs.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/settings">Open settings</Link>
        </Button>
      </section>

      {gmailStatus === "connected" ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Gmail connected successfully.
        </div>
      ) : null}
      {gmailStatus === "failed" ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Gmail connection failed. Check your Google OAuth settings and try again.
          {gmailError ? ` Reason: ${gmailError}` : ""}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle>Google integration</CardTitle>
            <CardDescription>Connect Gmail to enable unread email processing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "outline"}>
                {isConnected ? "Connected" : "Not connected"}
              </Badge>
              <p className="text-sm text-muted-foreground">Provider: Gmail</p>
            </div>

            {isConnected ? (
              <p className="text-sm text-muted-foreground">
                Your Google account is linked. Cron jobs can now fetch unread emails.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Connect your Google account to start the email summary pipeline.
              </p>
            )}

            {!isConnected ? (
              <Button asChild>
                <Link href="/api/auth/google">Connect Google Account</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle>Last 10 runs</CardTitle>
            <CardDescription>
              Most recent agent executions from the audit log.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentRuns.length ? (
              <div className="space-y-3">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {new Date(run.ranAt).toLocaleString()}
                      </p>
                      <Badge variant={run.status === "success" ? "default" : "destructive"}>
                        {run.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Emails found: {run.emailsFound} • Summaries sent: {run.summariesSent}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border/70 px-3 py-6 text-center text-sm text-muted-foreground">
                No agent runs yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
