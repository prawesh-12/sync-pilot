import { afterEach, describe, expect, it } from "vitest";
import { pathToFileURL } from "node:url";
import { isEntryPoint } from "../../server/entry-point";

const originalArgv = process.argv[1];

afterEach(() => {
  process.argv[1] = originalArgv;
});

describe("isEntryPoint", () => {
  it("is true for the module the process was started with", () => {
    process.argv[1] = "/app/server.ts";

    expect(isEntryPoint(pathToFileURL("/app/server.ts").href)).toBe(true);
  });

  it("is false for a module that was only imported", () => {
    process.argv[1] = "/app/worker.ts";

    expect(isEntryPoint(pathToFileURL("/app/server.ts").href)).toBe(false);
  });

  it("resolves a relative entry path, as `tsx server.ts` produces", () => {
    process.argv[1] = "server.ts";

    expect(isEntryPoint(pathToFileURL(`${process.cwd()}/server.ts`).href)).toBe(
      true,
    );
  });

  it("is false when the process has no entry path", () => {
    delete process.argv[1];

    expect(isEntryPoint(pathToFileURL("/app/server.ts").href)).toBe(false);
  });
});
