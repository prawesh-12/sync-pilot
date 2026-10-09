import { NAV_LINKS } from "@/components/landing/landing-content";
import { LandingNavActions } from "@/components/landing/landing-nav-actions";
import { Container, LandingLogo } from "@/components/landing/landing-ui";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-q-line bg-q-canvas/70 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <LandingLogo />

        <nav aria-label="Sections" className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md text-sm text-q-fg-3 transition-colors duration-100 hover:text-q-fg"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <LandingNavActions />
      </Container>
    </header>
  );
}
