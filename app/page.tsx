import Link from "next/link";
import Image from "next/image";
import { DM_Sans } from "next/font/google";
import { Brain } from "lucide-react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Home() {
  return (
    <main
      className={`${dmSans.className} relative flex flex-1 flex-col overflow-x-hidden bg-[#07070f] text-white`}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative z-10 flex h-full flex-col">
        <section className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-4 md:gap-7 md:px-12">
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 text-center">
              <p className="mx-auto flex w-fit items-center gap-1 rounded-full border border-[#A089E6]/30 bg-[#A089E6]/10 px-4 py-1 text-xs text-[#A089E6]">
                <Brain /> Powered by Groq LLM
              </p>

              <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white md:text-5xl">
                Your Inbox, Summarized
                <br />
                Delivered to{" "}
                <span className="relative inline-block">
                  <Image
                    src="/signal-app.svg"
                    alt=""
                    width={100}
                    height={100}
                    className="pointer-events-none absolute -top-7 -right-20"
                    aria-hidden="true"
                  />
                  <span className="bg-linear-to-r from-white to-[#A089E6] bg-clip-text text-transparent">
                    Signal
                  </span>
                </span>
              </h1>

              <p className="max-w-lg text-sm leading-relaxed text-gray-400">
                SyncPilot connects your Gmail, reads every new email with AI,
                and sends you a clean summary directly in Signal. No noise,
                just signal.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[#A089E6] px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#8b6fd4]"
                >
                  Get Started <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            <div
              id="how-it-works"
              className="grid grid-cols-1 gap-4 px-2 md:grid-cols-3 md:px-4"
            >
              <article className="flex flex-col gap-2 rounded-2xl border border-[#A089E6]/15 bg-white/4 p-5 transition-all hover:border-[#A089E6]/40">
                <div className="w-fit rounded-lg bg-[#A089E6]/10 p-1.5 text-[#A089E6]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-8 w-8"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="m4 7 8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Gmail Connected</h2>
                <p className="text-sm text-gray-400">
                  Monitors your inbox via Google OAuth. Real-time, zero friction.
                </p>
              </article>

              <article className="flex flex-col gap-2 rounded-2xl border border-[#A089E6]/15 bg-white/4 p-5 transition-all hover:border-[#A089E6]/40">
                <div className="w-fit rounded-lg bg-[#A089E6]/10 p-1.5 text-[#A089E6]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-8 w-8"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 4.5c2.8 0 5 2.2 5 5 0 .9-.2 1.8-.7 2.6-.3.5-.5 1.1-.5 1.7V15a2 2 0 0 1-2 2h-3.6a2 2 0 0 1-2-2v-1.2c0-.6-.2-1.2-.5-1.7A5 5 0 0 1 7 9.5c0-2.8 2.2-5 5-5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M10 20h4M9.5 17.5h5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <path
                      d="m17.8 6.2.9-.9M6.3 17.7l-.9.9M6.2 6.2l-.9-.9M17.7 17.7l.9.9"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">AI Summarization</h2>
                <p className="text-sm text-gray-400">
                  Groq LLM condenses long emails into 2-line summaries instantly.
                </p>
              </article>

              <article className="flex flex-col gap-2 rounded-2xl border border-[#A089E6]/15 bg-white/4 p-5 transition-all hover:border-[#A089E6]/40">
                <div className="w-fit rounded-lg bg-[#A089E6]/10 p-1.5 text-[#A089E6]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-8 w-8"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6.8A2.8 2.8 0 0 1 6.8 4h10.4A2.8 2.8 0 0 1 20 6.8v6.4a2.8 2.8 0 0 1-2.8 2.8H10l-4.5 3.5V16H6.8A2.8 2.8 0 0 1 4 13.2V6.8Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m13.5 7.5-3 3h2.3l-2.3 3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Signal Delivery</h2>
                <p className="text-sm text-gray-400">
                  Encrypted summaries land in Signal. Private, fast, no noise.
                </p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
