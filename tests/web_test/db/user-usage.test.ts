import { beforeEach, describe, expect, it, vi } from "vitest";

type SumRow = { totalTokensUsed: number | string; emailCount: number | string };

let selectResult: SumRow[] = [];

const fakeDb = {
  select: () => ({
    from: () => ({
      where: () => Promise.resolve(selectResult),
    }),
  }),
};

vi.mock("@/db/client", () => ({ getDb: () => fakeDb }));

const { getLifetimeUsage } = await import("@/db/queries/user-usage");

describe("getLifetimeUsage", () => {
  beforeEach(() => {
    selectResult = [];
  });

  it("returns the summed totals", async () => {
    selectResult = [{ totalTokensUsed: 716211, emailCount: 360 }];

    await expect(getLifetimeUsage("user-1")).resolves.toEqual({
      totalTokensUsed: 716211,
      emailCount: 360,
    });
  });

  it("coerces the strings a sum can return", async () => {
    selectResult = [{ totalTokensUsed: "716211", emailCount: "360" }];

    await expect(getLifetimeUsage("user-1")).resolves.toEqual({
      totalTokensUsed: 716211,
      emailCount: 360,
    });
  });

  it("returns zeros when the user has no usage rows", async () => {
    selectResult = [];

    await expect(getLifetimeUsage("user-1")).resolves.toEqual({
      totalTokensUsed: 0,
      emailCount: 0,
    });
  });
});
