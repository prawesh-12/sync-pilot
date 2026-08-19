import type { Metadata } from "next";
import {
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
import { SiteFooter } from "@/components/site-footer";
import { SiteBackdrop } from "@/components/site-backdrop";

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
      'On the dashboard, click the "Connection Setting" button to open the settings page.',
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
      <header className="sticky top-0 z-50 border-b border-white/8 bg-sp-base">
        <div className="sp-container flex items-center justify-between gap-6 py-4">
          <BrandLogo />
          <LandingAuth />
        </div>
      </header>

      <main className="relative flex flex-1 flex-col overflow-x-hidden">
        <SiteBackdrop />

        <div className="sp-container relative z-10 py-16 sm:py-24">
          <div className="mx-auto w-full max-w-2xl">
            <header className="mb-12 text-center">
              <h1 className="sp-h2 text-sp-text">How to use SyncPilot</h1>
              <p className="sp-body mx-auto mt-4 max-w-md text-sp-muted">
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
                        className="absolute left-5 top-12 bottom-0 w-px bg-gradient-to-b from-sp-cobalt/35 to-sp-cobalt/5"
                      />
                    ) : null}

                    <div className="sp-label relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-[#8b6fd4] bg-sp-cobalt text-[#f0eeff] shadow-md shadow-black/20">
                      {index + 1}
                    </div>

                    <div className="sp-surface-1 sp-hover-lift flex-1 p-5">
                      <div className="flex items-center gap-2">
                        <Icon
                          className="size-5 shrink-0 text-sp-cobalt"
                          aria-hidden="true"
                        />
                        <h2 className="sp-h3 text-sp-text">{step.title}</h2>
                      </div>
                      <p className="sp-body mt-2 text-sp-muted">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
