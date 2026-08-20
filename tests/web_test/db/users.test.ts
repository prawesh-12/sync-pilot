import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Row = { id: string };
type Inserted = { id: string; email: string };

let selectResults: Row[][] = [];
let inserted: Inserted[] = [];
let selectCalls = 0;

const fakeDb = {
  select: () => {
    selectCalls += 1;

    return {
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(selectResults.shift() ?? []),
        }),
      }),
    };
  },
  insert: () => ({
    values: (value: Inserted) => ({
      onConflictDoNothing: () => {
        inserted.push(value);

        return Promise.resolve();
      },
    }),
  }),
};

vi.mock("@/db/client", () => ({ getDb: () => fakeDb }));

const { resolveUserIdByEmail } = await import("@/db/queries/users");

beforeEach(() => {
  selectResults = [];
  inserted = [];
  selectCalls = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("resolveUserIdByEmail", () => {
  it("reuses the existing row for that email", async () => {
    selectResults = [[{ id: "existing-user-id" }]];

    const id = await resolveUserIdByEmail("user@example.com", "freshly-minted");

    expect(id).toBe("existing-user-id");
    expect(inserted).toEqual([]);
  });

  it("creates a row for an unknown email and returns that id", async () => {
    selectResults = [[], [{ id: "freshly-minted" }]];

    const id = await resolveUserIdByEmail("new@example.com", "freshly-minted");

    expect(id).toBe("freshly-minted");
    expect(inserted).toEqual([
      { id: "freshly-minted", email: "new@example.com" },
    ]);
  });

  it("normalizes the email before looking up or writing", async () => {
    selectResults = [[], [{ id: "freshly-minted" }]];

    await resolveUserIdByEmail("  User@Example.COM  ", "freshly-minted");

    expect(inserted[0]?.email).toBe("user@example.com");
  });

  it("re-reads after inserting so concurrent sign ins agree", async () => {
    selectResults = [[], [{ id: "winner-id" }]];

    const id = await resolveUserIdByEmail("race@example.com", "loser-id");

    expect(id).toBe("winner-id");
    expect(selectCalls).toBe(2);
  });

  it("falls back to the minted id when the re-read finds nothing", async () => {
    selectResults = [[], []];

    const id = await resolveUserIdByEmail("gone@example.com", "freshly-minted");

    expect(id).toBe("freshly-minted");
  });

  it("does not touch the database for a blank email", async () => {
    const id = await resolveUserIdByEmail("   ", "freshly-minted");

    expect(id).toBe("freshly-minted");
    expect(selectCalls).toBe(0);
    expect(inserted).toEqual([]);
  });
});
