import Link from "next/link";
import { Heart } from "lucide-react";

/**
 * The product footer, in the landing page's voice: one hairline rule, the
 * shared container, mono labels, and the same muted link treatment.
 */

const linkClass =
  "sp-focus sp-body rounded-[6px] text-sp-muted transition-colors duration-150 hover:text-sp-text";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/8">
      <div className="sp-container flex flex-col items-center gap-3 py-6 text-center sm:flex-row sm:justify-between sm:gap-4 sm:text-left">
        <span className="sp-label normal-case tracking-[0.04em] text-sp-muted">
          &copy; {new Date().getFullYear()} SyncPilot AI. All rights reserved.
        </span>

        <nav aria-label="Legal" className="flex items-center gap-4">
          <Link href="/privacy" className={linkClass}>
            Privacy
          </Link>
          <Link href="/terms" className={linkClass}>
            Terms
          </Link>
        </nav>

        <span className="sp-body flex items-center gap-1.5 text-sp-muted">
          Built with
          <Heart size={14} aria-hidden="true" className="text-sp-cobalt" />
          for Signal users
        </span>
      </div>
    </footer>
  );
}
