import { Skeleton } from "@/components/ui/Skeleton";

export function AgentConsoleSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton width="80px" height="1.5rem" rounded="rounded-full" />
        <Skeleton width="100px" height="1.5rem" rounded="rounded-full" />
        <Skeleton width="120px" height="1.5rem" rounded="rounded-full" />
        <Skeleton width="90px" height="1.5rem" rounded="rounded-full" />
      </div>

      <div>
        <Skeleton width="100px" height="16px" className="mb-2" />
        <Skeleton width="100%" height="1.5rem" className="mt-2" />
        <Skeleton width="75%" height="1.5rem" className="mt-2" />
      </div>

      <div>
        <Skeleton width="80px" height="16px" className="mb-2" />
        <div className="mt-2 space-y-2">
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="80%" height="1rem" />
        </div>
      </div>

      <div>
        <Skeleton width="150px" height="16px" className="mb-2" />
        <div className="mt-3 space-y-3">
          <Skeleton width="100%" height="4.5rem" rounded="rounded-2xl" />
          <Skeleton width="100%" height="4.5rem" rounded="rounded-2xl" />
          <Skeleton width="100%" height="4.5rem" rounded="rounded-2xl" />
        </div>
      </div>

      <div>
        <Skeleton width="100px" height="16px" className="mb-2" />
        <div className="mt-3">
          <Skeleton width="100%" height="7rem" rounded="rounded-2xl" />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Skeleton width="120px" height="16px" className="mb-2" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton width="60px" height="1.5rem" rounded="rounded-full" />
            <Skeleton width="80px" height="1.5rem" rounded="rounded-full" />
            <Skeleton width="70px" height="1.5rem" rounded="rounded-full" />
          </div>
        </div>
        <div>
          <Skeleton width="150px" height="16px" className="mb-2" />
          <div className="mt-3">
             <Skeleton width="80%" height="1rem" />
          </div>
        </div>
      </div>
    </div>
  );
}
