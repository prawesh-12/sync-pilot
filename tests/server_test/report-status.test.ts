import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serverConfig = {
  webAppUrl: "https://app.example.com",
  syncSecret: "sync-secret",
};

vi.mock("../../server/config", () => ({ serverConfig }));

const { reportJobStatus } = await import("../../server/report-status");

const report = {
  bullJobId: "42",
  userId: "user-1",
  integrationId: "integration-1",
  status: "completed" as const,
};

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

describe("reportJobStatus", () => {
  it("posts the report to the web app's sync-jobs endpoint", async () => {
    await reportJobStatus(report);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://app.example.com/api/internal/sync-jobs");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual(report);
  });

  it("authenticates with the shared sync secret", async () => {
    await reportJobStatus(report);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      "x-secret": "sync-secret",
    });
  });

  it("keeps the endpoint path when the base URL has one", async () => {
    serverConfig.webAppUrl = "https://app.example.com/base/";

    await reportJobStatus(report);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("https://app.example.com/api/internal/sync-jobs");
  });

  it("does nothing when no web app URL is configured", async () => {
    serverConfig.webAppUrl = "";

    await reportJobStatus(report);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("swallows a rejected report rather than failing the job", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(reportJobStatus(report)).resolves.toBeUndefined();
  });

  it("swallows a network error rather than failing the job", async () => {
    fetchMock.mockRejectedValue(new Error("connection refused"));

    await expect(reportJobStatus(report)).resolves.toBeUndefined();
  });

  it("swallows a malformed web app URL", async () => {
    serverConfig.webAppUrl = "not a url";

    await expect(reportJobStatus(report)).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
