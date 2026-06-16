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

// Returns the most recently connected ACTIVE Gmail account, which is the one
// the user just authorised in the OAuth callback.
export async function getLatestGmailConnection(userId: string) {
    const composio = getComposio();
    const { items } = await composio.connectedAccounts.list({
        userIds: [userId],
        toolkitSlugs: [GMAIL_TOOLKIT_SLUG],
        statuses: ["ACTIVE"],
        orderBy: "created_at",
    });

    return [...items].sort(byNewestFirst)[0] ?? null;
}

function byNewestFirst(
    first: { createdAt?: string },
    second: { createdAt?: string },
) {
    return (second.createdAt ?? "").localeCompare(first.createdAt ?? "");
}

export async function executeGmailTool(
    userId: string,
    slug: string,
    args: Record<string, unknown> = {},
    connectedAccountId?: string,
): Promise<GmailToolResult> {
    const composio = getComposio();
    const { gmailToolkitVersion } = getComposioConfig();
    // Composio requires a toolkit version for manual execution. Pin one via
    // COMPOSIO_GMAIL_TOOLKIT_VERSION (recommended for production); otherwise
    // fall back to "latest" with the version check explicitly skipped.
    const response = await composio.tools.execute(slug, {
        userId,
        arguments: args,
        // Target a specific account so users with multiple Gmails resolve correctly.
        ...(connectedAccountId ? { connectedAccountId } : {}),
        ...(gmailToolkitVersion
            ? { version: gmailToolkitVersion }
            : { dangerouslySkipVersionCheck: true }),
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
