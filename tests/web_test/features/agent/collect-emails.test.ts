import { describe, expect, it, vi } from "vitest";

// collect-emails pulls in gmail + db modules; stub them so the pure self-sent
// filter can be imported without a real client.
vi.mock("@/features/gmail/gmail", () => ({}));
vi.mock("@/db/queries", () => ({}));

const { dropSelfSentEmails } = await import("@/features/agent/collect-emails");

const email = (from: string, messageId = from) => ({
  messageId,
  threadId: "t",
  subject: "s",
  from,
  body: "b",
});

describe("dropSelfSentEmails", () => {
  const own = "tom.spiderman@gmail.com";

  it("drops emails the account sent itself (bare address)", () => {
    const kept = dropSelfSentEmails([email(own), email("other@x.com")], own);
    expect(kept.map((e) => e.from)).toEqual(["other@x.com"]);
  });

  it('drops self-sent when From is "Name <addr>" and matches case-insensitively', () => {
    const kept = dropSelfSentEmails(
      [email("Tom S <TOM.SPIDERMAN@gmail.com>"), email("b@x.com")],
      own,
    );
    expect(kept.map((e) => e.from)).toEqual(["b@x.com"]);
  });

  it("keeps everything when the account address is unknown", () => {
    const all = [email(own), email("b@x.com")];
    expect(dropSelfSentEmails(all, null)).toHaveLength(2);
  });

  it("keeps inbound mail from other senders", () => {
    const all = [email("a@x.com"), email("b@x.com")];
    expect(dropSelfSentEmails(all, own)).toHaveLength(2);
  });
});
