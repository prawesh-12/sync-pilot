import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const serverConfig = {
  syncSecret: "sync-secret",
  serverPort: 0,
  // Left empty so the dashboard is never mounted, and no Redis connection opens.
  queueDashboardUser: "",
  queueDashboardPassword: "",
};

const enqueueSyncJobs = vi.fn();

vi.mock("../../server/config", () => ({ serverConfig }));
vi.mock("../../server/queue", () => ({
  enqueueSyncJobs,
  getEmailQueue: () => {
    throw new Error("the queue must not be built in this test");
  },
}));

const { createServer } = await import("../../server/server");

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = await new Promise<Server>((resolve) => {
    const listening = createServer().listen(0, () => resolve(listening));
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  enqueueSyncJobs.mockReset();
  enqueueSyncJobs.mockResolvedValue(0);
});

afterEach(() => {
  vi.clearAllMocks();
});

function postSync(body: unknown, secret?: string) {
  return fetch(`${baseUrl}/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret === undefined ? {} : { "x-secret": secret }),
    },
    body: JSON.stringify(body),
  });
}

const JOB = { userId: "user-1", integrationId: "integration-1" };

describe("GET /health", () => {
  it("reports ok without a secret", async () => {
    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });
});

describe("POST /sync authentication", () => {
  it("rejects a request with no secret", async () => {
    const response = await postSync({ jobs: [JOB] });

    expect(response.status).toBe(401);
    expect(enqueueSyncJobs).not.toHaveBeenCalled();
  });

  it("rejects a wrong secret", async () => {
    const response = await postSync({ jobs: [JOB] }, "wrong-secret");

    expect(response.status).toBe(401);
    expect(enqueueSyncJobs).not.toHaveBeenCalled();
  });

  // Same length as the real secret, so this fails on content, not on length.
  it("rejects a same-length wrong secret", async () => {
    const response = await postSync({ jobs: [JOB] }, "sync-secreT");

    expect(response.status).toBe(401);
  });

  it("accepts the configured secret", async () => {
    enqueueSyncJobs.mockResolvedValue(1);
    const response = await postSync({ jobs: [JOB] }, "sync-secret");

    expect(response.status).toBe(200);
  });
});

describe("POST /sync job parsing", () => {
  it("enqueues the jobs it was given", async () => {
    enqueueSyncJobs.mockResolvedValue(1);
    const response = await postSync({ jobs: [JOB] }, "sync-secret");

    expect(await response.json()).toEqual({ ok: true, enqueued: 1 });
    expect(enqueueSyncJobs).toHaveBeenCalledWith([JOB]);
  });

  it("drops entries that are not shaped like a job", async () => {
    await postSync(
      {
        jobs: [
          JOB,
          { userId: "user-2" },
          { integrationId: "integration-2" },
          { userId: 7, integrationId: "integration-3" },
          null,
          "not-a-job",
        ],
      },
      "sync-secret",
    );

    expect(enqueueSyncJobs).toHaveBeenCalledWith([JOB]);
  });

  it("treats a body with no jobs key as an empty batch", async () => {
    const response = await postSync({}, "sync-secret");

    expect(response.status).toBe(200);
    expect(enqueueSyncJobs).toHaveBeenCalledWith([]);
  });

  it("treats a non-array jobs value as an empty batch", async () => {
    await postSync({ jobs: "all of them" }, "sync-secret");

    expect(enqueueSyncJobs).toHaveBeenCalledWith([]);
  });
});

describe("POST /sync failure handling", () => {
  it("returns 500 without leaking the underlying error", async () => {
    enqueueSyncJobs.mockRejectedValue(new Error("redis is down at 10.0.0.4"));
    const response = await postSync({ jobs: [JOB] }, "sync-secret");

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to enqueue jobs." });
  });
});

describe("queue dashboard", () => {
  // getEmailQueue throws in this file's mock, so a 404 proves it was never built.
  it("is not mounted when no credentials are configured", async () => {
    const response = await fetch(`${baseUrl}/admin/queues`);

    expect(response.status).toBe(404);
  });
});
