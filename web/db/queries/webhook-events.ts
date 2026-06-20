import { getDb } from "@/db/client";
import { processedWebhookEvents } from "@/db/schema";

// Claims a webhook event id for processing. Returns true if this is the first
// time we've seen it (caller should apply side effects), false if it was already
// processed (caller should skip). The insert + onConflictDoNothing is atomic, so
// concurrent duplicate deliveries can't both win the claim.
export async function claimWebhookEvent(
  eventId: string,
  provider: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .insert(processedWebhookEvents)
    .values({ eventId, provider })
    .onConflictDoNothing({ target: processedWebhookEvents.eventId })
    .returning({ eventId: processedWebhookEvents.eventId });

  return rows.length > 0;
}
