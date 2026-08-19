import { afterEach, describe, expect, it, vi } from "vitest";

const runAgent = vi.fn();

vi.mock("../../server/agent", () => ({ runAgent }));
// bullmq is only needed for startWorker, which this file never calls.
vi.mock("bullmq", () => ({ Worker: class {} }));

const { processJob } = await import("../../server/worker");

const job = { userId: "user-1", integrationId: "integration-1" };

afterEach(() => {
  vi.clearAllMocks();
});

describe("processJob", () => {
  it("delegates the job to the agent", async () => {
    runAgent.mockResolvedValue(undefined);

    await processJob(job);

    expect(runAgent).toHaveBeenCalledWith(job);
  });

  // BullMQ retries on a rejected promise, so the failure must propagate.
  it("propagates an agent failure so BullMQ can retry", async () => {
    runAgent.mockRejectedValue(new Error("agent run failed"));

    await expect(processJob(job)).rejects.toThrow("agent run failed");
  });
});
