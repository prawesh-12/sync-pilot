import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// True only when the given module is the file the process was started with, so
// importing server.ts or worker.ts does not bind a port or open a connection.
export function isEntryPoint(moduleUrl: string): boolean {
  const entry = process.argv[1];

  if (!entry) {
    return false;
  }

  return resolve(entry) === fileURLToPath(moduleUrl);
}
