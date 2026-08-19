import Link from "next/link";
import { Heart } from "lucide-react";

// Separate from SiteFooter because the app shell still runs on the shadcn theme.
export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-sp-text/8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-5 py-8 text-center sm:flex-row sm:justify-between sm:gap-6 sm:text-left">
        <p className="text-sm text-sp-muted">
          &copy; {new Date().getFullYear()} SyncPilot AI
        </p>

        <nav
          aria-label="Legal"
          className="flex items-center gap-2 text-sm text-sp-muted"
        >
          <Link
            href="/privacy"
            className="rounded-[5px] transition-colors hover:text-sp-text focus-visible:ring-2 focus-visible:ring-sp-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sp-base focus-visible:outline-none"
          >
            Privacy
          </Link>
          <span aria-hidden="true" className="text-sp-muted/40">
            &middot;
          </span>
          <Link
            href="/terms"
            className="rounded-[5px] transition-colors hover:text-sp-text focus-visible:ring-2 focus-visible:ring-sp-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sp-base focus-visible:outline-none"
          >
            Terms
          </Link>
          <span aria-hidden="true" className="text-sp-muted/40">
            &middot;
          </span>
          <Link
            href="/how-to-use"
            className="rounded-[5px] transition-colors hover:text-sp-text focus-visible:ring-2 focus-visible:ring-sp-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sp-base focus-visible:outline-none"
          >
            Docs
          </Link>
        </nav>

        <p className="flex items-center gap-1.5 text-sm text-sp-muted">
          Built with
          <Heart size={13} aria-hidden="true" className="text-sp-amber" />
          for Signal users
        </p>
      </div>
    </footer>
  );
}
