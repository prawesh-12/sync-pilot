import type { NextFunction, Request, Response } from "express";
import { serverConfig } from "./config";
import { secureEquals } from "./secure-compare";

// HTTP Basic-auth guard for the queue dashboard. Credentials are compared in
// constant time so they can't be brute-forced via response timing.
export function basicAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const [scheme, encoded] = header.split(" ");

  if (scheme === "Basic" && encoded) {
    const [user, password] = Buffer.from(encoded, "base64")
      .toString()
      .split(":");

    if (
      secureEquals(user, serverConfig.queueDashboardUser) &&
      secureEquals(password, serverConfig.queueDashboardPassword)
    ) {
      next();
      return;
    }
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="queue-dashboard"');
  res.status(401).send("Authentication required.");
}
