import Link from "next/link";
import { FOOTER_LEGAL_LINKS } from "@/components/landing/landing-content";
import { Container, LandingLogo } from "@/components/landing/landing-ui";

const linkClass =
  "rounded-md text-[13px] text-q-fg-3 transition-colors duration-100 hover:text-q-fg";

export function LandingFooter() {
  return (
    <footer className="relative -mt-24 pb-12 md:-mt-28">
      <Container className="flex flex-col items-center gap-5 text-center md:flex-row md:gap-4 md:text-left">
        <LandingLogo />
        <p className="order-last text-xs text-q-fg-4 md:order-none">
          &copy; {new Date().getFullYear()} SyncPilot AI
        </p>
        <nav aria-label="Legal" className="md:ml-auto">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
