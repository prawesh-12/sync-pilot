import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#07070f] text-white">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)] opacity-60" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        {/* Header Section */}
        <section className="mb-8 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton width="160px" height="36px" />
            <Skeleton width="280px" height="20px" />
          </div>
          <Skeleton width="180px" height="34px" rounded="rounded-full" />
        </section>

        {/* Integration Box */}
        <section className="space-y-6">
          <div className="rounded-2xl border border-[#A089E6]/15 bg-white/4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Skeleton width="140px" height="32px" />
              </div>
              <Skeleton width="100px" height="28px" rounded="rounded-lg" />
            </div>
            <div className="mt-3">
              <Skeleton width="60%" height="20px" />
            </div>
          </div>

          {/* Last 10 Runs Box */}
          <div className="mx-auto w-full max-w-md rounded-2xl border border-[#A089E6]/15 bg-white/4 p-6">
            <Skeleton width="120px" height="28px" />
            <div className="mt-2">
              <Skeleton width="200px" height="20px" />
            </div>

            <div className="mt-4 space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#A089E6]/10 bg-white/3 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Skeleton width="140px" height="20px" />
                    <Skeleton width="60px" height="20px" rounded="rounded-full" />
                  </div>
                  <div className="mt-1.5">
                    <Skeleton width="220px" height="16px" />
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
