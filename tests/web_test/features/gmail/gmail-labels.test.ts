import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const executeGmailTool = vi.fn();

vi.mock("@/lib/composio", () => ({ executeGmailTool }));

// The label cache is module state, so each case re-imports for a clean map.
async function loadResolveLabelId() {
  vi.resetModules();
  const loaded = await import("@/features/gmail/gmail-labels");

  return loaded.resolveLabelId;
}

const account = { userId: "user-1", connectedAccountId: "conn-1" };

function labelsResponse(labels: { id: string; name: string }[]) {
  return { data: { response_data: { labels } } };
}

beforeEach(() => {
  executeGmailTool.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("resolveLabelId", () => {
  it("returns the id of an existing label", async () => {
    executeGmailTool.mockResolvedValueOnce(
      labelsResponse([{ id: "Label_7", name: "SyncPilot" }]),
    );
    const resolveLabelId = await loadResolveLabelId();

    expect(await resolveLabelId(account, "SyncPilot")).toBe("Label_7");
    expect(executeGmailTool).toHaveBeenCalledOnce();
  });

  it("matches an existing label case-insensitively", async () => {
    executeGmailTool.mockResolvedValueOnce(
      labelsResponse([{ id: "Label_7", name: "SyncPilot" }]),
    );
    const resolveLabelId = await loadResolveLabelId();

    expect(await resolveLabelId(account, "syncpilot")).toBe("Label_7");
  });

  it("trims the requested name before matching", async () => {
    executeGmailTool.mockResolvedValueOnce(
      labelsResponse([{ id: "Label_7", name: "SyncPilot" }]),
    );
    const resolveLabelId = await loadResolveLabelId();

    expect(await resolveLabelId(account, "  SyncPilot  ")).toBe("Label_7");
  });

  it("creates the label when it does not exist yet", async () => {
    executeGmailTool
      .mockResolvedValueOnce(labelsResponse([{ id: "Label_1", name: "Other" }]))
      .mockResolvedValueOnce({ data: { id: "Label_9" } });
    const resolveLabelId = await loadResolveLabelId();

    expect(await resolveLabelId(account, "SyncPilot")).toBe("Label_9");
    expect(executeGmailTool).toHaveBeenNthCalledWith(
      2,
      "user-1",
      "GMAIL_CREATE_LABEL",
      { label_name: "SyncPilot" },
      "conn-1",
    );
  });

  it("throws when Gmail returns no id for a created label", async () => {
    executeGmailTool
      .mockResolvedValueOnce(labelsResponse([]))
      .mockResolvedValueOnce({ data: {} });
    const resolveLabelId = await loadResolveLabelId();

    await expect(resolveLabelId(account, "SyncPilot")).rejects.toThrow(
      'Gmail did not return an id for label "SyncPilot".',
    );
  });

  it("ignores label entries missing an id or a name", async () => {
    executeGmailTool
      .mockResolvedValueOnce(
        labelsResponse([
          { id: "", name: "SyncPilot" },
          { id: "Label_3", name: "" },
        ] as { id: string; name: string }[]),
      )
      .mockResolvedValueOnce({ data: { id: "Label_9" } });
    const resolveLabelId = await loadResolveLabelId();

    expect(await resolveLabelId(account, "SyncPilot")).toBe("Label_9");
  });

  it("caches a resolved id so the second call makes no Gmail request", async () => {
    executeGmailTool.mockResolvedValueOnce(
      labelsResponse([{ id: "Label_7", name: "SyncPilot" }]),
    );
    const resolveLabelId = await loadResolveLabelId();

    await resolveLabelId(account, "SyncPilot");
    await resolveLabelId(account, "SyncPilot");

    expect(executeGmailTool).toHaveBeenCalledOnce();
  });

  it("keeps each user's cache separate", async () => {
    executeGmailTool
      .mockResolvedValueOnce(labelsResponse([{ id: "Label_7", name: "SyncPilot" }]))
      .mockResolvedValueOnce(labelsResponse([{ id: "Label_8", name: "SyncPilot" }]));
    const resolveLabelId = await loadResolveLabelId();

    expect(await resolveLabelId(account, "SyncPilot")).toBe("Label_7");
    expect(
      await resolveLabelId({ userId: "user-2", connectedAccountId: "conn-2" }, "SyncPilot"),
    ).toBe("Label_8");
  });
});
