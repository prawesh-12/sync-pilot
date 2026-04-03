import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, CalendarDays, Mail, ShieldCheck } from "lucide-react";
import { AgentConsole } from "@/components/dashboard/agent-console";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCerebrasConfig,
  isCerebrasConfigured,
  isGoogleOAuthConfigured,
} from "@/lib/env";

type DashboardPageProps = {
  searchParams: Promise<{
    gmail?: string | string[];
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { orgId, sessionId, userId } = await auth();
  const params = await searchParams;
  const cerebrasConfig = getCerebrasConfig();
  const cerebrasReady = isCerebrasConfigured();
  const googleReady = isGoogleOAuthConfigured();
  const gmailStatus = Array.isArray(params.gmail) ? params.gmail[0] : params.gmail;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      {gmailStatus === "connected" ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Gmail connected successfully. SyncPilot can now fetch unread email for
          this account.
        </div>
      ) : null}
      {gmailStatus === "failed" ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Gmail connection failed. Check your Google OAuth settings and try
          again.
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            Authenticated operator workspace
          </Badge>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">
              The agent layer is now wired into your protected dashboard.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              SyncPilot can now send structured operations requests to Cerebras
              using GPT OSS, keep the provider key on the server, and return a
              review-ready brief for human approval.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/">
                Back home
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            {googleReady ? (
              <Button asChild>
                <Link href="/api/auth/google">Connect Gmail</Link>
              </Button>
            ) : (
              <Badge variant="destructive">Missing Google OAuth env</Badge>
            )}
          </div>
        </div>

        <Card className="border-border/80 bg-card/80 shadow-2xl shadow-black/10">
          <CardHeader>
            <CardTitle>Runtime status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <ShieldCheck className="size-5" />
              <p className="mt-3 font-medium">Auth session</p>
              <p className="mt-1 text-sm text-muted-foreground">{sessionId}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <Mail className="size-5" />
              <p className="mt-3 font-medium">AI provider</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {cerebrasReady
                  ? `${cerebrasConfig.model} via Cerebras`
                  : "Waiting for CEREBRAS_API_KEY"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <CalendarDays className="size-5" />
              <p className="mt-3 font-medium">Active organization</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {orgId ?? "No organization set"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                User ID
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{userId}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <AgentConsole
        isConfigured={cerebrasReady}
        modelName={cerebrasConfig.model}
      />
    </main>
  );
}
