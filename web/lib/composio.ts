import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { getComposioConfig } from "@/config/env";
import { withTimeoutAndRetry } from "@/lib/retry";

const GMAIL_TOOLKIT_SLUG = "gmail";
// Bound how long we wait on Composio so one hung call can't consume the whole
// cron window. Retries are opt-in per call (idempotent reads only).
const GMAIL_TOOL_TIMEOUT_MS = 30_000;

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
        allowMultiple: true,
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

// Set retries > 0 ONLY for idempotent reads (fetching mail/profile). Leave it 0
// for mutations (send/archive/draft/label): a timed-out-but-applied write must
// never be repeated, or the user gets duplicate sends.
type ExecuteOptions = { retries?: number };

export async function executeGmailTool(
    userId: string,
    slug: string,
    args: Record<string, unknown> = {},
    connectedAccountId?: string,
    options: ExecuteOptions = {},
): Promise<GmailToolResult> {
    const composio = getComposio();
    const { gmailToolkitVersion } = getComposioConfig();

    const response = await withTimeoutAndRetry(
        () =>
            // Composio requires a toolkit version for manual execution. Pin one
            // via COMPOSIO_GMAIL_TOOLKIT_VERSION (recommended for production);
            // otherwise fall back to "latest" with the version check skipped.
            composio.tools.execute(slug, {
                userId,
                arguments: args,
                // Target a specific account so multi-Gmail users resolve correctly.
                ...(connectedAccountId ? { connectedAccountId } : {}),
                ...(gmailToolkitVersion
                    ? { version: gmailToolkitVersion }
                    : { dangerouslySkipVersionCheck: true }),
            }),
        {
            timeoutMs: GMAIL_TOOL_TIMEOUT_MS,
            retries: options.retries ?? 0,
            label: `Composio tool ${slug}`,
        },
    );

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
