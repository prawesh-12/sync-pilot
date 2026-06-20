import { describe, expect, it } from "vitest";
import {
  groupBySender,
  indexByRecipient,
  lastFour,
  normalizePhoneNumber,
} from "@/features/signal/routing";

const make = (senderNumber: string, recipientNumber: string, userId: string) => ({
  senderNumber,
  recipientNumber,
  userId,
});

describe("normalizePhoneNumber", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizePhoneNumber("  +15550001041 ")).toBe("+15550001041");
  });
});

describe("lastFour", () => {
  it("masks all but the last four digits", () => {
    expect(lastFour("+15550001041")).toBe("1041");
  });

  it("pads short values to four chars", () => {
    expect(lastFour("12")).toBe("**12");
  });
});

describe("groupBySender", () => {
  it("groups integrations sharing a sender number", () => {
    const groups = groupBySender([
      make("+1111", "+aaaa", "u1"),
      make("+1111", "+bbbb", "u2"),
      make("+2222", "+cccc", "u3"),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveLength(2);
    expect(groups[1]).toHaveLength(1);
  });

  it("treats whitespace-padded sender numbers as the same group", () => {
    const groups = groupBySender([
      make("+1111", "+aaaa", "u1"),
      make(" +1111 ", "+bbbb", "u2"),
    ]);

    expect(groups).toHaveLength(1);
  });
});

describe("indexByRecipient", () => {
  it("maps a message's sender (recipient number) back to its integration", () => {
    const integrations = [make("+1111", "+aaaa", "u1"), make("+1111", "+bbbb", "u2")];
    const index = indexByRecipient(integrations);

    expect(index.get("+aaaa")?.userId).toBe("u1");
    expect(index.get("+bbbb")?.userId).toBe("u2");
    expect(index.get("+unknown")).toBeUndefined();
  });
});
