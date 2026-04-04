import { DM_Sans } from "next/font/google";
import { Skeleton } from "@/components/ui/Skeleton";

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
});

export default function HomeLoading() {
    return (
        <main
            aria-busy="true"
            className={`${dmSans.className} relative flex flex-1 flex-col overflow-x-hidden bg-[#07070f] text-white`}
        >
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)]" />
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]" />

            <div className="relative z-10 flex h-full flex-col">
                <section className="flex flex-1 flex-col">
                    <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-4 md:gap-7 md:px-12">
                        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 text-center">
                            <Skeleton width="170px" height="28px" rounded="rounded-full" />

                            <div className="space-y-3">
                                <Skeleton width="420px" height="44px" />
                                <Skeleton width="360px" height="44px" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton width="430px" height="18px" />
                                <Skeleton width="380px" height="18px" />
                            </div>

                            <Skeleton width="150px" height="40px" rounded="rounded-full" />
                        </div>

                        <div className="grid grid-cols-1 gap-4 px-2 md:grid-cols-3 md:px-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <article
                                    key={index}
                                    className="flex flex-col gap-2 rounded-2xl border border-[#A089E6]/15 bg-white/4 p-5"
                                >
                                    <Skeleton width="44px" height="44px" rounded="rounded-lg" />
                                    <Skeleton width="180px" height="24px" />
                                    <Skeleton width="220px" height="16px" />
                                    <Skeleton width="190px" height="16px" />
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
