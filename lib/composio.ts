import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { getComposioConfig } from "@/config/env";

const GMAIL_TOOLKIT_SLUG = "gmail";

type GmailToolResult = {
    successful: boolean;
    data: Record<string, unknown>;
    error: string | null;
};

let composioClient: Composio<VercelProvider> | null = null;

export function getComposio() {
    if (!composioClient) {
        const config = getComposioConfig();
        composioClient = new Composio({
            apiKey: config.apiKey,
            provider: new VercelProvider(),
        });
    }

    return composioClient;
}

export async function initiateGmailConnection(
    userId: string,
    callbackUrl: string,
) {
    const composio = getComposio();
    const { gmailAuthConfigId } = getComposioConfig();

    return composio.connectedAccounts.link(userId, gmailAuthConfigId, {
        callbackUrl,
    });
}

export async function getActiveGmailConnection(userId: string) {
    const composio = getComposio();
    const { items } = await composio.connectedAccounts.list({
        userIds: [userId],
        toolkitSlugs: [GMAIL_TOOLKIT_SLUG],
        statuses: ["ACTIVE"],
        orderBy: "created_at",
    });

    return items[0] ?? null;
}

export async function executeGmailTool(
    userId: string,
    slug: string,
    args: Record<string, unknown> = {},
): Promise<GmailToolResult> {
    const composio = getComposio();
    const response = await composio.tools.execute(slug, {
        userId,
        arguments: args,
    });

    if (!response.successful) {
        throw new Error(
            response.error || `Composio tool ${slug} execution failed.`,
        );
    }

    return {
        successful: response.successful,
        data: response.data ?? {},
        error: response.error,
    };
}
