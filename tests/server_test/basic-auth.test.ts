import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The middleware only touches these members, so the test declares them locally
// rather than pulling express's types across the package boundary.
type Request = { headers: { authorization?: string } };
type Response = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => Response;
  send: (body: string) => Response;
};
type NextFunction = () => void;

const serverConfig = {
  queueDashboardUser: "admin",
  queueDashboardPassword: "hunter2",
};

vi.mock("../../server/config", () => ({ serverConfig }));

const { basicAuth } = await import("../../server/basic-auth");

function encode(user: string, password: string) {
  return Buffer.from(`${user}:${password}`).toString("base64");
}

function makeContext(authorization?: string) {
  const req: Request = { headers: authorization ? { authorization } : {} };
  const setHeader = vi.fn();
  const status = vi.fn(() => res);
  const send = vi.fn(() => res);
  const res: Response = { setHeader, status, send };
  const next = vi.fn();

  return { req, res, next, setHeader, status, send };
}

// One cast, here, so express's full Request/Response types stay out of the
// assertions. The middleware reads only what the stubs above provide.
function callBasicAuth(context: ReturnType<typeof makeContext>) {
  const run = basicAuth as unknown as (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  run(context.req, context.res, context.next);
}

beforeEach(() => {
  serverConfig.queueDashboardUser = "admin";
  serverConfig.queueDashboardPassword = "hunter2";
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("basicAuth", () => {
  it("calls next when both credentials match", () => {
    const context = makeContext(`Basic ${encode("admin", "hunter2")}`);

    callBasicAuth(context);

    expect(context.next).toHaveBeenCalledOnce();
    expect(context.status).not.toHaveBeenCalled();
  });

  it("rejects a wrong password", () => {
    const context = makeContext(`Basic ${encode("admin", "wrong")}`);

    callBasicAuth(context);

    expect(context.next).not.toHaveBeenCalled();
    expect(context.status).toHaveBeenCalledWith(401);
  });

  it("rejects a wrong user", () => {
    const context = makeContext(`Basic ${encode("root", "hunter2")}`);

    callBasicAuth(context);

    expect(context.next).not.toHaveBeenCalled();
    expect(context.status).toHaveBeenCalledWith(401);
  });

  it("rejects a missing Authorization header", () => {
    const context = makeContext();

    callBasicAuth(context);

    expect(context.next).not.toHaveBeenCalled();
    expect(context.status).toHaveBeenCalledWith(401);
  });

  it("rejects a non-Basic scheme", () => {
    const context = makeContext("Bearer some-token");

    callBasicAuth(context);

    expect(context.next).not.toHaveBeenCalled();
    expect(context.status).toHaveBeenCalledWith(401);
  });

  it("rejects an empty credential when the dashboard is unconfigured", () => {
    serverConfig.queueDashboardUser = "";
    serverConfig.queueDashboardPassword = "";
    const context = makeContext(`Basic ${encode("", "")}`);

    callBasicAuth(context);

    expect(context.next).not.toHaveBeenCalled();
    expect(context.status).toHaveBeenCalledWith(401);
  });

  it("sends a WWW-Authenticate challenge on rejection", () => {
    const context = makeContext();

    callBasicAuth(context);

    expect(context.setHeader).toHaveBeenCalledWith(
      "WWW-Authenticate",
      'Basic realm="queue-dashboard"',
    );
  });
});
