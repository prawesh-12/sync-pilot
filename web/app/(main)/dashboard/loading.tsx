import { Skeleton } from "@/components/ui/Skeleton";
import {
  IntegrationStatusSkeleton,
  RecentRunsSkeleton,
} from "@/components/dashboard/dashboard-section-skeletons";
import { SiteBackdrop } from "@/components/site-backdrop";

export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      className="relative flex w-full flex-1 flex-col overflow-x-hidden bg-sp-base text-sp-text sm:overflow-hidden"
    >
      <SiteBackdrop />

      <div className="relative z-10 flex w-full flex-col px-4 py-4 pb-20 sm:mx-auto sm:h-full sm:max-w-5xl sm:overflow-hidden sm:px-6 sm:pb-4">
        <section className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h1 className="sp-h3 text-sp-text">Dashboard</h1>
            <p className="mt-0.5 text-sm text-sp-muted">
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
