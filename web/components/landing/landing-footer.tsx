import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import {
  FOOTER_LEGAL_LINKS,
  FOOTER_PRODUCT_LINKS,
  SIGNAL_DISCLAIMER,
} from "@/components/landing/landing-content";
import { Container, Label } from "@/components/landing/layout-primitives";

const linkClass =
  "sp-focus sp-body rounded-[6px] text-sp-muted transition-colors duration-150 hover:text-sp-text";

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/8">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <nav aria-label="Product">
            <Label>Product</Label>
            <ul className="mt-4 flex flex-col gap-3">
              {FOOTER_PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <Label>Legal</Label>
            <ul className="mt-4 flex flex-col gap-3">
              {FOOTER_LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <BrandLogo />
            <p className="sp-body sp-measure mt-4 text-sp-muted">
              {SIGNAL_DISCLAIMER}
            </p>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/8">
        <Container className="py-6">
          <Label className="normal-case tracking-[0.04em]">
            &copy; {new Date().getFullYear()} SyncPilot AI
          </Label>
        </Container>
      </div>
    </footer>
  );
}
