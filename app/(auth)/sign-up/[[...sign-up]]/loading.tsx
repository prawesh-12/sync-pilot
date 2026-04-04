import { Skeleton } from "@/components/ui/Skeleton";

export default function SignUpLoading() {
    return (
        <div aria-busy="true" className="mx-auto flex w-full max-w-md justify-center">
            <div className="w-full rounded-2xl border border-[#A089E6]/15 bg-white/4 p-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton width="160px" height="28px" />
                        <Skeleton width="220px" height="16px" />
                    </div>

                    <div className="space-y-3">
                        <Skeleton width="100%" height="42px" />
                        <Skeleton width="100%" height="42px" />
                        <Skeleton width="100%" height="42px" />
                    </div>

                    <Skeleton width="100%" height="42px" />
                    <Skeleton width="100%" height="14px" />
                </div>
            </div>
        </div>
    );
}
