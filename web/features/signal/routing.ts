// Pure helpers for routing inbound Signal messages to the right integration.
// Kept I/O-free so the poll cron's grouping/matching logic is unit-testable.

export function normalizePhoneNumber(value: string): string {
  return value.trim();
}

// Masks all but the last four digits for safe logging of phone numbers.
export function lastFour(value: string): string {
  return value.trim().slice(-4).padStart(4, "*");
}

// Groups integrations by their linked sender number so we drain each signal-cli
// sender queue exactly once per poll, then route within the group by recipient.
export function groupBySender<T extends { senderNumber: string }>(
  integrations: T[],
): T[][] {
  const groups = new Map<string, T[]>();

  for (const integration of integrations) {
    const sender = normalizePhoneNumber(integration.senderNumber);
    const group = groups.get(sender) ?? [];
    group.push(integration);
    groups.set(sender, group);
  }

  return [...groups.values()];
}

// Indexes integrations by normalized recipient number so an inbound message's
// sender (the user's own phone) maps back to the owning integration.
export function indexByRecipient<T extends { recipientNumber: string }>(
  integrations: T[],
): Map<string, T> {
  return new Map(
    integrations.map((integration) => [
      normalizePhoneNumber(integration.recipientNumber),
      integration,
    ]),
  );
}
