import { BrandLogo } from "@/components/brand-logo";
import { ctaButtonTheme } from "@/components/cta-button-class";
import { PendingLink } from "@/components/pending-link";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";
import { SiteBackdrop } from "@/components/site-backdrop";

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
      <header className="sticky top-0 z-50 border-b border-white/8 bg-sp-base">
        <div className="sp-container flex items-center justify-between gap-6 py-4">
          <BrandLogo />
          <PendingLink
            href="/dashboard"
            className={cn(ctaButtonTheme, "px-4 py-1.5 text-xs")}
          >
            Dashboard
          </PendingLink>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col">
        <SiteBackdrop />

        <article className="sp-container relative z-10 py-16 sm:py-24">
          <div className="mx-auto w-full max-w-3xl">
            <header className="mb-12 border-b border-white/8 pb-8">
              <h1 className="sp-h2 text-sp-text">{title}</h1>
              <p className="sp-label mt-4 block normal-case tracking-[0.04em] text-sp-muted">
                Last updated: {lastUpdated}
              </p>
            </header>

            {/* Headings inside the prose use the display face at sp-h3's size.
                An arbitrary variant can only carry Tailwind utilities, so the
                sp-* class cannot be applied through one. */}
            <div className="sp-body space-y-8 text-sp-muted [&_h2]:font-display [&_h2]:text-xl [&_h2]:leading-tight [&_h2]:font-semibold [&_h2]:text-sp-text [&_h2]:mb-3 [&_h2]:not-first:mt-10 [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:space-y-2">
              {children}
            </div>
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
