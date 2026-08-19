import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serverConfig = {
  webAppUrl: "https://app.example.com",
  syncSecret: "sync-secret",
};

vi.mock("../../server/config", () => ({ serverConfig }));

const { runAgent } = await import("../../server/agent");

const job = { userId: "user-1", integrationId: "integration-1" };

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  serverConfig.webAppUrl = "https://app.example.com";
  fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("runAgent", () => {
  it("posts the job to the web app's run-job endpoint", async () => {
    await runAgent(job);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://app.example.com/api/agent/run-job");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual(job);
  });

  it("authenticates with the shared sync secret", async () => {
    await runAgent(job);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ "x-secret": "sync-secret" });
  });

  it("resolves when the endpoint returns 200", async () => {
    await expect(runAgent(job)).resolves.toBeUndefined();
  });

  it("throws when WEB_APP_URL is not configured", async () => {
    serverConfig.webAppUrl = "";

    await expect(runAgent(job)).rejects.toThrow("WEB_APP_URL is not configured.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // Throwing is what lets BullMQ retry the job, so each failure shape must throw.
  it("throws with the endpoint's error detail on a failure response", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "gmail token expired" }, 500));

    await expect(runAgent(job)).rejects.toThrow(
      "Agent run failed for integration integration-1 (status 500): gmail token expired",
    );
  });

  it("throws with a placeholder when the failure body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>502</html>", { status: 502 }));

    await expect(runAgent(job)).rejects.toThrow(
      "Agent run failed for integration integration-1 (status 502): no error detail",
    );
  });

  it("throws with a placeholder when the failure body has no error field", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: false }, 400));

    await expect(runAgent(job)).rejects.toThrow("(status 400): no error detail");
  });

  it("propagates a network error", async () => {
    fetchMock.mockRejectedValue(new Error("connection refused"));

    await expect(runAgent(job)).rejects.toThrow("connection refused");
  });
});
