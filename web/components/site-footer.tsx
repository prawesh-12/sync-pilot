import Link from "next/link";
import { Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/5">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-4 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:text-left">
        <p className="text-sm text-white/40">
          © {new Date().getFullYear()} SyncPilot AI. All rights reserved.
        </p>

        <nav aria-label="Legal" className="flex items-center gap-2 text-sm">
          <Link
            href="/privacy"
            className="text-white/50 transition-colors hover:text-white/80"
          >
            Privacy Policy
          </Link>
          <span aria-hidden="true" className="text-white/20">
            ·
          </span>
          <Link
            href="/terms"
            className="text-white/50 transition-colors hover:text-white/80"
          >
            Terms of Service
          </Link>
        </nav>

        <p className="flex items-center gap-1.5 text-sm text-white/40">
          Built with
          <Heart size={14} aria-hidden="true" className="text-[#6c4de6]" />
          for Signal users
        </p>
      </div>
    </footer>
  );
}
