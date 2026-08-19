import { BrandLogo } from "@/components/brand-logo";
import { LandingNavAuth } from "@/components/landing/landing-nav-auth";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#A089E6]/10 bg-[#07070f]/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
        <BrandLogo />
        <LandingNavAuth />
      </div>
    </header>
  );
}
