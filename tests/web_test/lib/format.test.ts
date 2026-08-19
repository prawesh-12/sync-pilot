import { afterEach, describe, expect, it, vi } from "vitest";
import { formatNumber, formatRelativeTime } from "@/lib/format";

const NOW = new Date("2026-06-15T12:00:00.000Z");

function ago(milliseconds: number) {
  return new Date(NOW.getTime() - milliseconds);
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

afterEach(() => {
  vi.useRealTimers();
});

function freezeClock() {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
}

describe("formatNumber", () => {
  it("separates thousands", () => {
    expect(formatNumber(32400)).toBe("32,400");
  });

  it("leaves values under a thousand alone", () => {
    expect(formatNumber(999)).toBe("999");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("separates every group in a large value", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });
});

describe("formatRelativeTime", () => {
  it("reports anything under a minute as just now", () => {
    freezeClock();
    expect(formatRelativeTime(ago(59 * SECOND))).toBe("just now");
  });

  it("switches to minutes at exactly one minute", () => {
    freezeClock();
    expect(formatRelativeTime(ago(MINUTE))).toBe("1 minute ago");
  });

  it("pluralizes minutes", () => {
    freezeClock();
    expect(formatRelativeTime(ago(5 * MINUTE))).toBe("5 minutes ago");
  });

  it("switches to hours at exactly one hour", () => {
    freezeClock();
    expect(formatRelativeTime(ago(HOUR))).toBe("1 hour ago");
  });

  it("reports the last minute before a day as hours", () => {
    freezeClock();
    expect(formatRelativeTime(ago(DAY - MINUTE))).toBe("23 hours ago");
  });

  it("switches to days at exactly one day", () => {
    freezeClock();
    expect(formatRelativeTime(ago(DAY))).toBe("1 day ago");
  });

  it("still reports days at six days", () => {
    freezeClock();
    expect(formatRelativeTime(ago(6 * DAY))).toBe("6 days ago");
  });

  it("falls back to an absolute date at seven days", () => {
    freezeClock();
    expect(formatRelativeTime(ago(7 * DAY))).toBe("Jun 8, 2026");
  });

  it("accepts an ISO string as well as a Date", () => {
    freezeClock();
    expect(formatRelativeTime(ago(2 * HOUR).toISOString())).toBe("2 hours ago");
  });

  it("reports a future timestamp as just now rather than a negative age", () => {
    freezeClock();
    expect(formatRelativeTime(new Date(NOW.getTime() + HOUR))).toBe("just now");
  });
});
