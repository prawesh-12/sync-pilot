import { getConnectedGmailAddress } from "@/features/gmail/gmail";

export async function ConnectedEmailDetails({ userId }: { userId: string }) {
    let email: string | null = null;
    try {
        email = await getConnectedGmailAddress(userId);
    } catch (error) {
        console.error("[SETTINGS] Failed to resolve connected Gmail address");
        console.error(error);
    }

    return <span className="text-sm text-muted-foreground break-all">{email || "Unable to load Gmail address"}</span>;
}
