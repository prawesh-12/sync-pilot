import { Skeleton } from "@/components/ui/Skeleton";

export function AgentDecisionsSkeleton() {
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className="flex items-center justify-between gap-4 rounded-xl border border-[#A089E6]/10 bg-white/3 px-4 py-3"
        >
          <div className="space-y-1">
            <Skeleton width="220px" height="16px" className="bg-[#A089E6]/15" />
            <Skeleton width="320px" height="12px" className="bg-[#A089E6]/10" />
          </div>
          <Skeleton
            width="70px"
            height="18px"
            rounded="rounded-full"
            className="bg-[#A089E6]/20"
          />
        </li>
      ))}
    </ul>
  );
}
