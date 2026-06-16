import { Skeleton } from "@/components/ui/Skeleton";

export function IntegrationStatusSkeleton() {
  return (
    <div className="shrink-0 flex flex-col gap-2 rounded-2xl border border-[#A089E6]/15 bg-white/4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3">
      <div className="space-y-1">
        <Skeleton width="110px" height="24px" className="bg-[#A089E6]/20" />
        <Skeleton width="380px" height="14px" className="bg-[#A089E6]/15" />
      </div>
      <Skeleton width="92px" height="24px" rounded="rounded-lg" className="bg-[#A089E6]/20" />
    </div>
  );
}

export function UsageSkeleton() {
  return (
    <div className="shrink-0 flex flex-col gap-3 rounded-2xl border border-[#A089E6]/15 bg-white/4 px-4 py-4 sm:px-5">
      <Skeleton width="80px" height="24px" className="bg-[#A089E6]/20" />
      <Skeleton width="100%" height="14px" className="bg-[#A089E6]/15" />
      <Skeleton width="240px" height="12px" className="bg-[#A089E6]/15" />
    </div>
  );
}

export function RecentRunsSkeleton() {
  return (
    <div className="flex w-full flex-col rounded-2xl border border-[#A089E6]/15 bg-white/4 p-4">
      <div className="space-y-1">
        <Skeleton width="110px" height="24px" className="bg-[#A089E6]/20" />
        <Skeleton width="210px" height="14px" className="bg-[#A089E6]/15" />
      </div>

      <div className="mt-4 grid grid-cols-1 content-start gap-4 sm:grid-cols-2 sm:overflow-y-auto sm:pb-2 sm:pr-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-[#A089E6]/10 bg-white/3 px-3 py-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2">
              <Skeleton width="155px" height="18px" className="bg-[#A089E6]/15" />
              <Skeleton
                width="70px"
                height="18px"
                rounded="rounded-full"
                className="bg-[#A089E6]/20"
              />
            </div>
            <div className="mt-1.5">
              <Skeleton width="220px" height="14px" className="bg-[#A089E6]/15" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
