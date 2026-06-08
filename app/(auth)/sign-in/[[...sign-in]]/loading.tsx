import { Skeleton } from "@/components/ui/Skeleton";

export default function SignInLoading() {
    return (
        <div
            aria-busy="true"
            className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-[#A089E6]/15 bg-white/4 px-6 py-10"
        >
            <div className="flex flex-col items-center gap-2">
                <Skeleton width="200px" height="28px" />
                <Skeleton width="240px" height="16px" />
            </div>

            <Skeleton width="100%" height="44px" rounded="rounded-full" />
        </div>
    );
}
