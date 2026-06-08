import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import {
  ArrowRight,
  LogIn,
  Mail,
  Phone,
  QrCode,
  Settings,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { LandingAuth } from "@/components/landing-auth";
import { PendingLink } from "@/components/pending-link";
import { SiteFooter } from "@/components/site-footer";
import { ctaButtonClass } from "@/components/cta-button-class";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "How to use — SyncPilot",
  description:
    "Set up SyncPilot in six steps: sign in with Google, connect Gmail, link Signal, and start receiving AI email summaries.",
};

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    icon: LogIn,
    title: "Sign In",
    description:
      'Click "Get Started" and sign in with your Google account through OAuth.',
  },
  {
    icon: Settings,
    title: "Open Connection Settings",
    description:
      'On the dashboard, click the "Connection Setting" button to open the setup panel.',
  },
  {
    icon: Mail,
    title: "Connect Gmail",
    description:
      'Click "Connect Google Account" to link the inbox the agent will fetch and summarise (read-only).',
  },
  {
    icon: Smartphone,
    title: "Install Signal",
    description: "Download the Signal app on your phone and register your number.",
  },
  {
    icon: QrCode,
    title: "Scan Signal QR",
    description:
      'Click "Generate Signal QR", then scan it from Signal → Linked Devices to link your device.',
  },
  {
    icon: Phone,
    title: "Add Numbers",
    description:
      "Enter your sender and recipient Signal numbers, then save to complete the setup.",
  },
];

export default function HowToUsePage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#A089E6]/10 bg-[#07070f]/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandLogo />
          <LandingAuth />
        </div>
      </header>

      <main
        className={`${dmSans.className} relative flex flex-1 flex-col overflow-x-hidden bg-[#07070f] text-white`}
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]" />

        <div className="relative z-10 mx-auto w-full max-w-2xl px-6 py-14 sm:py-20">
          <header className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How to use SyncPilot
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-gray-400">
              Connect your inbox to Signal and start receiving AI summaries in six
              quick steps.
            </p>
          </header>

          <ol className="space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <li
                  key={step.title}
                  className="relative flex gap-5 pb-8 last:pb-0"
                >
                  {!isLast ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-5 top-12 bottom-0 w-px bg-gradient-to-b from-[#A089E6]/35 to-[#A089E6]/5"
                    />
                  ) : null}

                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-[#8b6fd4] bg-[#6c4de6] text-sm font-bold text-[#f0eeff] shadow-md shadow-black/20">
                    {index + 1}
                  </div>

                  <div className="flex-1 rounded-2xl border border-[#A089E6]/15 bg-white/4 p-5 transition-colors hover:border-[#A089E6]/40">
                    <div className="flex items-center gap-2">
                      <Icon
                        className="size-5 shrink-0 text-[#A089E6]"
                        aria-hidden="true"
                      />
                      <h2 className="text-base font-semibold text-white">
                        {step.title}
                      </h2>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
