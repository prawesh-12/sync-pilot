"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { NAV_LINKS } from "@/components/landing/landing-content";
import { Container } from "@/components/landing/layout-primitives";
import { LandingNavAuth } from "@/components/landing/landing-nav-auth";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD_PX = 40;

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        // Fixed rather than sticky: a bar in the flow would push the first
        // panel down by its own height, and every snap point with it, leaving
        // the page unable to rest at the top. Panels clear it with 96px of
        // their own top padding. Opaque and above every panel, so a heading is
        // never readable through the bar it slides under.
        "fixed inset-x-0 top-0 z-[60] bg-sp-base transition-[border-color] duration-200",
        isScrolled ? "border-b border-white/8" : "border-b border-transparent",
      )}
    >
      <Container className="flex items-center justify-between gap-6 py-4">
        <BrandLogo />

        <nav aria-label="Sections" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="sp-focus rounded-[6px] text-sm text-sp-muted transition-colors duration-150 hover:text-sp-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <LandingNavAuth />
      </Container>
    </header>
  );
}
