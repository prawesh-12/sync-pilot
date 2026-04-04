import { Skeleton } from "@/components/ui/Skeleton";

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
          <div className="space-y-1">
            <Skeleton width="140px" height="32px" />
            <Skeleton width="320px" height="16px" />
          </div>
          <div className="w-full sm:w-44">
            <Skeleton height="34px" rounded="rounded-full" />
          </div>
        </section>

        <section className="flex flex-col gap-4 sm:flex-1 sm:min-h-0">
          <div className="shrink-0 flex flex-col gap-2 rounded-2xl border border-[#A089E6]/15 bg-white/4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3">
            <div className="space-y-1">
              <Skeleton width="110px" height="24px" />
              <Skeleton width="380px" height="14px" />
            </div>
            <Skeleton width="92px" height="24px" rounded="rounded-lg" />
          </div>

          <div className="flex w-full flex-col rounded-2xl border border-[#A089E6]/15 bg-white/4 p-4">
            <div className="space-y-1">
              <Skeleton width="110px" height="24px" />
              <Skeleton width="210px" height="14px" />
            </div>

            <div className="mt-4 grid grid-cols-1 content-start gap-4 sm:grid-cols-2 sm:overflow-y-auto sm:pb-2 sm:pr-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[#A089E6]/10 bg-white/3 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2">
                    <Skeleton width="155px" height="18px" />
                    <Skeleton width="70px" height="18px" rounded="rounded-full" />
                  </div>
                  <div className="mt-1.5">
                    <Skeleton width="220px" height="14px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
