import { cn } from "@/lib/utils";

// Color / visual identity ONLY (no size, padding, or layout) — the single source of
// truth for button styling. Apply to any button to match the "Get Started" design system;
// each button keeps its own contextual sizing. Includes dark: overrides so it wins over
// shadcn Button variants (outline/default) in dark mode via tailwind-merge.
export const ctaButtonTheme =
  "cursor-pointer rounded-full border border-[#8b6fd4] bg-[#6c4de6] font-semibold text-[#f0eeff] shadow-md shadow-black/20 transition-all duration-200 ease-out hover:border-[#A089E6] hover:bg-[#6c4de6] hover:text-[#f0eeff] hover:shadow-[0_0_18px_rgba(108,77,230,0.5)] active:scale-[0.98] dark:border-[#8b6fd4] dark:bg-[#6c4de6] dark:hover:bg-[#6c4de6]";

// Full large hero CTA (Get Started) — theme + layout + large size.
export const ctaButtonClass = cn(
  ctaButtonTheme,
  "group inline-flex items-center gap-2 px-7 py-3 text-base",
);
