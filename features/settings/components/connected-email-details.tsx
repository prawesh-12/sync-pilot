import { getConnectedGmailAddress } from "@/features/gmail/gmail";
import { type getIntegration } from "@/db/queries";

export async function ConnectedEmailDetails({ integration }: { integration: NonNullable<Awaited<ReturnType<typeof getIntegration>>> }) {
    let email: string | null = null;
    try {
        email = await getConnectedGmailAddress({
            accessTokenEncrypted: integration.accessTokenEncrypted,
            refreshTokenEncrypted: integration.refreshTokenEncrypted,
        });
    } catch (error) {
        console.error("[SETTINGS] Failed to resolve connected Gmail address");
        console.error(error);
    }

    return <span className="text-sm text-muted-foreground break-all">{email || "Unable to load Gmail address"}</span>;
}
