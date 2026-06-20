const DEFAULT_BACKOFF_MS = 500;

export type TimeoutRetryOptions = {
  timeoutMs: number;
  // Number of RETRIES after the first attempt. Use 0 for non-idempotent calls
  // (e.g. sending mail) so a timed-out-but-applied write is never repeated.
  retries: number;
  label: string;
  backoffMs?: number;
};

// Races a promise against a timeout and retries on failure with linear backoff.
// The timeout only bounds how long WE wait — it can't cancel an SDK call that
// ignores abort — so retries must be reserved for idempotent operations.
export async function withTimeoutAndRetry<T>(
  run: () => Promise<T>,
  options: TimeoutRetryOptions,
): Promise<T> {
  const backoffMs = options.backoffMs ?? DEFAULT_BACKOFF_MS;
  let lastError: unknown;

  for (let attempt = 0; attempt <= options.retries; attempt += 1) {
    try {
      return await Promise.race([run(), timeout(options.timeoutMs, options.label)]);
    } catch (error) {
      lastError = error;

      if (attempt < options.retries) {
        await delay(backoffMs * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function timeout(ms: number, label: string): Promise<never> {
  return new Promise((_resolve, reject) => {
    setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms.`)),
      ms,
    );
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
