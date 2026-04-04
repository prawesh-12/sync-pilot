import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      className="relative flex flex-1 flex-col overflow-hidden bg-[#07070f] text-white"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)] opacity-60" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden px-6 py-4">
        <section className="mb-4 flex shrink-0 items-end justify-between gap-4">
          <div className="space-y-1">
            <Skeleton width="140px" height="32px" />
            <Skeleton width="320px" height="16px" />
          </div>
          <Skeleton width="170px" height="34px" rounded="rounded-full" />
        </section>

        <section className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex shrink-0 items-center justify-between gap-4 rounded-2xl border border-[#A089E6]/15 bg-white/4 px-5 py-3">
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

            <div className="mt-4 grid grid-cols-1 content-start gap-4 overflow-y-auto pb-2 pr-2 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[#A089E6]/10 bg-white/3 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
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
