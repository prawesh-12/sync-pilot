import { describe, expect, it } from "vitest";
import {
  createUsageCollector,
  EMPTY_TOKEN_USAGE,
  getUsageMonth,
} from "@/features/agent/usage";

type Usage = Parameters<ReturnType<typeof createUsageCollector>["add"]>[0];

function usage(inputTokens: number, outputTokens: number, totalTokens: number) {
  return { inputTokens, outputTokens, totalTokens } as Usage;
}

describe("createUsageCollector", () => {
  it("starts at zero", () => {
    expect(createUsageCollector().snapshot()).toEqual(EMPTY_TOKEN_USAGE);
  });

  it("records one call's usage", () => {
    const collector = createUsageCollector();
    collector.add(usage(100, 40, 140));

    expect(collector.snapshot()).toEqual({
      promptTokens: 100,
      completionTokens: 40,
      totalTokens: 140,
    });
  });

  it("sums usage across several calls", () => {
    const collector = createUsageCollector();
    collector.add(usage(100, 40, 140));
    collector.add(usage(60, 10, 70));

    expect(collector.snapshot()).toEqual({
      promptTokens: 160,
      completionTokens: 50,
      totalTokens: 210,
    });
  });

  it("ignores an undefined usage report", () => {
    const collector = createUsageCollector();
    collector.add(usage(100, 40, 140));
    collector.add(undefined);

    expect(collector.snapshot().totalTokens).toBe(140);
  });

  it("treats missing token fields as zero", () => {
    const collector = createUsageCollector();
    collector.add({} as Usage);

    expect(collector.snapshot()).toEqual(EMPTY_TOKEN_USAGE);
  });

  it("returns a copy, so a snapshot cannot be mutated into the running total", () => {
    const collector = createUsageCollector();
    collector.add(usage(100, 40, 140));

    const snapshot = collector.snapshot();
    snapshot.totalTokens = 9999;

    expect(collector.snapshot().totalTokens).toBe(140);
  });

  it("keeps two collectors independent", () => {
    const first = createUsageCollector();
    const second = createUsageCollector();
    first.add(usage(100, 40, 140));

    expect(second.snapshot()).toEqual(EMPTY_TOKEN_USAGE);
  });
});

describe("getUsageMonth", () => {
  it("returns the calendar month bucket", () => {
    expect(getUsageMonth(new Date("2026-06-15T12:00:00.000Z"))).toBe("2026-06");
  });

  it("buckets the first instant of a month", () => {
    expect(getUsageMonth(new Date("2026-01-01T00:00:00.000Z"))).toBe("2026-01");
  });

  it("buckets the last instant of a month", () => {
    expect(getUsageMonth(new Date("2026-12-31T23:59:59.999Z"))).toBe("2026-12");
  });

  // The bucket is UTC, so a local-time date near midnight can land in the
  // previous month. Anything comparing buckets must use UTC too.
  it("buckets by UTC, not local time", () => {
    expect(getUsageMonth(new Date("2026-07-01T00:30:00.000Z"))).toBe("2026-07");
    expect(getUsageMonth(new Date("2026-06-30T23:30:00.000Z"))).toBe("2026-06");
  });
});
