import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, Shield, Sparkles, Waypoints, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-[calc(100vh-137px)] bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
            <Sparkles className="size-3.5" />
            Clerk auth + Groq agent
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Secure the operator dashboard and start running AI-assisted ops.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              SyncPilot now ships with Clerk-backed auth and a protected agent
              console that can send structured operations requests to Groq
              using GPT OSS. Start with inbox triage, scheduling briefs, and
              operator review loops.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {userId ? (
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/sign-up">
                    Create account
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card/70 p-4">
              <Shield className="size-5 text-foreground" />
              <p className="mt-3 font-medium">Route protection</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Private pages stay server-protected with Clerk middleware.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/70 p-4">
              <Waypoints className="size-5 text-foreground" />
              <p className="mt-3 font-medium">Straight redirects</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Successful auth sends users directly to the dashboard.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/70 p-4">
              <Sparkles className="size-5 text-foreground" />
              <p className="mt-3 font-medium">Structured AI output</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Agent runs return summary, actions, tags, and a reviewable draft
                response.
              </p>
            </div>
          </div>
        </section>

        <Card className="border-border/80 bg-card/80 shadow-2xl shadow-black/10">
          <CardHeader>
            <CardTitle>Operator flow</CardTitle>
            <CardDescription>
              The app now exposes a complete path from public landing page to
              protected AI operator console.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                01
              </p>
              <p className="mt-2 font-medium">Visit the public entry page</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Users can choose to sign in or create a new account from here.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                02
              </p>
              <p className="mt-2 font-medium">Authenticate with Clerk</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Dedicated sign-in and sign-up routes handle the full auth
                experience.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                03
              </p>
              <p className="mt-2 font-medium">Run the protected agent console</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Authenticated users land on `/dashboard` and can trigger a
                Groq-backed SyncPilot run.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                04
              </p>
              <p className="mt-2 flex items-center gap-2 font-medium">
                Review structured output
                <Zap className="size-4" />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                The agent returns a concise brief, next actions, and a draft
                reply instead of an unstructured wall of text.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
