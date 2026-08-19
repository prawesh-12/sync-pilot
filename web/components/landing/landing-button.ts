import { ctaButtonTheme } from "@/components/cta-button-class";

// Reuses the app's shared button theme so marketing and product stay in sync.

const focus =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#A089E6] focus-visible:ring-offset-2 focus-visible:ring-offset-sp-base";

const layout = "group inline-flex items-center justify-center gap-2";

export const landingPrimaryButton = `${ctaButtonTheme} ${focus} ${layout} px-5 py-3 text-[15px] sm:px-7`;

export const landingSecondaryButton = `${focus} ${layout} cursor-pointer rounded-full border border-[#A089E6]/30 bg-[#A089E6]/5 px-5 py-3 text-[15px] font-semibold text-[#f0eeff] transition-all duration-200 ease-out hover:border-[#A089E6]/60 hover:bg-[#A089E6]/12 active:scale-[0.98] sm:px-7`;

export const landingNavButton = `${ctaButtonTheme} ${focus} ${layout} px-4 py-2 text-sm`;
