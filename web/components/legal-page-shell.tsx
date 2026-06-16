import { BrandLogo } from "@/components/brand-logo";
import { ctaButtonTheme } from "@/components/cta-button-class";
import { PendingLink } from "@/components/pending-link";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";

type LegalPageShellProps = {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export function LegalPageShell({
  title,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#A089E6]/10 bg-[#07070f]/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandLogo />
          <PendingLink
            href="/dashboard"
            className={cn(ctaButtonTheme, "px-4 py-1.5 text-xs")}
          >
            Dashboard
          </PendingLink>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col bg-[#07070f] text-white">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]" />

        <article className="relative z-10 mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
          <header className="mb-10 border-b border-[#A089E6]/15 pb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-gray-400">
              Last updated: {lastUpdated}
            </p>
          </header>

          <div className="space-y-8 text-sm leading-relaxed text-gray-300 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:not-first:mt-2 [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:space-y-2">
            {children}
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
