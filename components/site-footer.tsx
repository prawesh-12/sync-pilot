import { BrandLogo } from "@/components/brand-logo";
import { PendingLink } from "@/components/pending-link";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-[#A089E6]/10 bg-[#07070f]/95 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#271A58_0%,transparent_65%)] opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#A089E615_1px,transparent_1px)] bg-size-[24px_24px] opacity-40" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 px-4 py-6 sm:flex-row sm:items-center sm:px-6">
        <div className="flex flex-col items-center gap-1.5 text-center sm:items-start sm:text-left">
          <BrandLogo size="sm" />
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} SyncPilot AI. All rights reserved.
          </p>
        </div>

        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center justify-center gap-2 sm:justify-end"
        >
          <PendingLink
            href="/privacy"
            className="rounded-full border border-transparent px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-[#A089E6]/20 hover:bg-[#A089E6]/10 hover:text-[#A089E6]"
          >
            Privacy Policy
          </PendingLink>
          <PendingLink
            href="/terms"
            className="rounded-full border border-transparent px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-[#A089E6]/20 hover:bg-[#A089E6]/10 hover:text-[#A089E6]"
          >
            Terms of Service
          </PendingLink>
        </nav>
      </div>
    </footer>
  );
}
