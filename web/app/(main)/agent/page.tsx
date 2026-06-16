import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AgentDecisionsList } from "@/components/agent/agent-decisions-list";
import { AgentDecisionsSkeleton } from "@/components/agent/agent-decisions-skeleton";

export default async function AgentPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="relative flex w-full flex-1 flex-col overflow-x-hidden bg-[#07070f] text-white">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)] opacity-60" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative z-10 flex w-full flex-col px-4 py-4 pb-20 sm:mx-auto sm:max-w-5xl sm:px-6 sm:pb-8">
        <section className="mb-4">
          <h1 className="text-2xl font-bold text-white">Agent Decisions</h1>
          <p className="mt-0.5 text-sm text-gray-400">
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
