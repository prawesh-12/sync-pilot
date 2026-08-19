import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AgentDecisionsList } from "@/components/agent/agent-decisions-list";
import { AgentDecisionsSkeleton } from "@/components/agent/agent-decisions-skeleton";
import { SiteBackdrop } from "@/components/site-backdrop";

export default async function AgentPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="relative flex w-full flex-1 flex-col overflow-x-hidden bg-sp-base text-sp-text">
      <SiteBackdrop />

      <div className="relative z-10 flex w-full flex-col px-4 py-4 pb-20 sm:mx-auto sm:max-w-5xl sm:px-6 sm:pb-8">
        <section className="mb-4">
          <h1 className="sp-h3 text-sp-text">Agent Decisions</h1>
          <p className="sp-body mt-1 text-sp-muted">
            What SyncPilot decided for each email, and why.
          </p>
        </section>

        <Suspense fallback={<AgentDecisionsSkeleton />}>
          <AgentDecisionsList userId={userId} />
        </Suspense>
      </div>
    </main>
  );
}
