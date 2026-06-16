// Composio wraps tool output in varying nesting (e.g. data.response_data.*),
// so these readers tolerate both flat and deeply-nested shapes.

export function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export function firstArray(
  record: Record<string, unknown>,
  keys: string[],
): unknown[] | null {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return null;
}

export function findString(value: unknown, keys: string[]): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  if (Array.isArray(value)) {
    return findStringInArray(value, keys);
  }

  const record = value as Record<string, unknown>;
  const direct = readString(record, keys);

  if (direct) {
    return direct;
  }

  for (const nested of Object.values(record)) {
    const found = findString(nested, keys);

    if (found) {
      return found;
    }
  }

  return "";
}

export function findArray(value: unknown, keys: string[]): unknown[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return findArrayInEntries(value, keys);
  }

  const record = value as Record<string, unknown>;
  const direct = firstArray(record, keys);

  if (direct) {
    return direct;
  }

  return findArrayInEntries(Object.values(record), keys);
}

function findStringInArray(entries: unknown[], keys: string[]): string {
  for (const entry of entries) {
    const found = findString(entry, keys);

    if (found) {
      return found;
    }
  }

  return "";
}

function findArrayInEntries(entries: unknown[], keys: string[]): unknown[] {
  for (const entry of entries) {
    const found = findArray(entry, keys);

    if (found.length > 0) {
      return found;
    }
  }

  return [];
}
