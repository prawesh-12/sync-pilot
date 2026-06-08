import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getActiveGmailConnection } from "@/lib/composio";
import { saveIntegration, upsertUser } from "@/db/queries";

const GMAIL_CONNECTED_STATUS = "connected";
const GMAIL_FAILED_STATUS = "failed";
const COMPOSIO_SUCCESS_STATUS = "success";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const email = session.user.email;
    const status = new URL(request.url).searchParams.get("status");

    if (!email) {
      throw new Error("Unable to resolve the user's email address.");
    }

    if (status && status !== COMPOSIO_SUCCESS_STATUS) {
      throw new Error("Composio reported a failed Gmail connection.");
    }

    const connection = await getActiveGmailConnection(userId);

    if (!connection) {
      throw new Error("No active Gmail connection was found for this user.");
    }

    await upsertUser({ id: userId, email });
    await saveIntegration(userId, { connectedAccountId: connection.id });

    return NextResponse.redirect(
      getDashboardUrl(request, GMAIL_CONNECTED_STATUS),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Composio callback failed.";

    console.error("[COMPOSIO_OAUTH] Callback failed");
    console.error(error);

    return NextResponse.redirect(
      getDashboardUrl(request, GMAIL_FAILED_STATUS, message),
    );
  }
}

function getDashboardUrl(
  request: Request,
  gmailStatus: string,
  errorMessage?: string,
) {
  const url = new URL(`/dashboard?gmail=${gmailStatus}`, request.url);

  if (errorMessage) {
    url.searchParams.set("gmailError", errorMessage);
  }

  return url;
}
