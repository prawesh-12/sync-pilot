"use client";

import { useFormStatus } from "react-dom";
import { Roboto } from "next/font/google";
import { Spinner } from "@/components/ui/spinner";

// Google's button specification calls for Roboto Medium, so it is loaded here
// rather than inheriting the site's own typeface.
const roboto = Roboto({ subsets: ["latin"], weight: ["500"] });

/**
 * Google sign-in button, built to Google's published branding guidelines for
 * the dark theme: #131314 surface, #8E918F border, #E3E3E3 label, Roboto Medium
 * at 14px, an 18px logo, and a 40px minimum height. Straying from this can hold
 * up OAuth verification, so do not restyle it to match the rest of the site.
 */
export function GoogleSignInSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${roboto.className} flex h-10 w-full cursor-pointer items-center justify-center gap-3 rounded-[20px] border border-[#8E918F] bg-[#131314] px-3 text-sm leading-none font-medium text-[#E3E3E3] transition-colors duration-150 hover:bg-[#1c1c1d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A089E6] disabled:opacity-70`}
    >
      {pending ? (
        <>
          <Spinner className="size-[18px]" />
          Signing in...
        </>
      ) : (
        <>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
