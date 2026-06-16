const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_BEFORE_ABSOLUTE = 7;

// Thousands-separated integer, e.g. 32400 -> "32,400".
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

// Coarse "time ago" label; falls back to an absolute date past a week.
export function formatRelativeTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < SECONDS_PER_MINUTE) {
    return "just now";
  }

  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);

  if (minutes < MINUTES_PER_HOUR) {
    return pluralize(minutes, "minute");
  }

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);

  if (hours < HOURS_PER_DAY) {
    return pluralize(hours, "hour");
  }

  const days = Math.floor(hours / HOURS_PER_DAY);

  if (days < DAYS_BEFORE_ABSOLUTE) {
    return pluralize(days, "day");
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function pluralize(count: number, unit: string): string {
  const suffix = count === 1 ? "" : "s";

  return `${count} ${unit}${suffix} ago`;
}
