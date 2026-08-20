export async function register() {
  // The SDK cannot run on the edge runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  await import("./instrumentation-node");
}
