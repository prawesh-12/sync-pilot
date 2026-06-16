import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Only allow same-origin relative paths as redirect targets to avoid open redirects.
 */
export function sanitizeReturnTo(
  value: string | null | undefined,
  fallback = "/dashboard",
) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
