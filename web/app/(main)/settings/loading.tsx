import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6"
    >
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width="180px" height="36px" />
          <Skeleton width="240px" height="20px" />
        </div>
        <Skeleton width="170px" height="36px" />
      </section>

      <section className="space-y-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/3">
          <div className="flex flex-row items-start justify-between gap-4 px-6 py-5">
            <div className="space-y-1">
              <Skeleton width="145px" height="22px" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton width="100px" height="24px" rounded="rounded-full" />
            </div>
          </div>
          <div className="space-y-4 px-6 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton width="200px" height="40px" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <div className="rounded-xl border border-[#A089E6]/30 bg-[#A089E6]/3">
          <div className="flex flex-row items-start justify-between gap-4 px-6 py-5">
            <div className="space-y-2">
              <Skeleton width="150px" height="22px" />
              <Skeleton width="190px" height="16px" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton width="120px" height="24px" rounded="rounded-full" />
            </div>
          </div>

          <div className="space-y-4 px-6 pb-6">
            <Skeleton width="160px" height="38px" />
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton width="120px" height="16px" />
                  <Skeleton width="100%" height="40px" />
                </div>
                <div className="space-y-2">
                  <Skeleton width="130px" height="16px" />
                  <Skeleton width="100%" height="40px" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton width="180px" height="40px" />
              </div>
            </div>

            <Skeleton width="150px" height="38px" />
          </div>
        </div>
      </section>
    </main>
  );
}
