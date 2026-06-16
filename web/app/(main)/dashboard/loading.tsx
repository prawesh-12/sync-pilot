import { Skeleton } from "@/components/ui/Skeleton";
import {
  IntegrationStatusSkeleton,
  RecentRunsSkeleton,
} from "@/components/dashboard/dashboard-section-skeletons";

export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      className="relative flex w-full flex-1 flex-col overflow-x-hidden bg-[#07070f] text-white sm:overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)] opacity-60" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative z-10 flex w-full flex-col px-4 py-4 pb-20 sm:mx-auto sm:h-full sm:max-w-5xl sm:overflow-hidden sm:px-6 sm:pb-4">
        <section className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              Monitor Gmail connection status and recent SyncPilot runs.
            </p>
          </div>
          <div className="w-full sm:w-44">
            <Skeleton height="34px" rounded="rounded-full" className="bg-white/20" />
          </div>
        </section>

        <section className="flex flex-col gap-4 sm:flex-1 sm:min-h-0">
          <IntegrationStatusSkeleton />
          <RecentRunsSkeleton />
        </section>
      </div>
    </main>
  );
}
