import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLatestGmailConnection } from "@/lib/composio";
import { getConnectedGmailAddress } from "@/features/gmail/gmail";
import { saveGmailAccount, upsertUser } from "@/db/queries";
import { sanitizeLabel, sanitizeReturnTo } from "@/lib/utils";

const GMAIL_CONNECTED_STATUS = "connected";
const GMAIL_FAILED_STATUS = "failed";
const COMPOSIO_SUCCESS_STATUS = "success";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));
  const requestedLabel = sanitizeLabel(searchParams.get("label"));

  try {
    const email = session.user.email;
    const status = searchParams.get("status");

    if (!email) {
      throw new Error("Unable to resolve the user's email address.");
    }

    if (status && status !== COMPOSIO_SUCCESS_STATUS) {
      throw new Error("Composio reported a failed Gmail connection.");
    }

    const connection = await getLatestGmailConnection(userId);

    if (!connection) {
      throw new Error("No active Gmail connection was found for this user.");
    }

    const gmailAddress = await resolveGmailAddress(userId, connection.id);

    await upsertUser({ id: userId, email });
    await saveGmailAccount(userId, {
      connectedAccountId: connection.id,
      emailAddress: gmailAddress,
      label: requestedLabel || deriveLabel(gmailAddress),
    });

    return NextResponse.redirect(
      getReturnUrl(request, returnTo, GMAIL_CONNECTED_STATUS),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Composio callback failed.";

    console.error("[COMPOSIO_OAUTH] Callback failed");
    console.error(error);

    return NextResponse.redirect(
      getReturnUrl(request, returnTo, GMAIL_FAILED_STATUS, message),
    );
  }
}

async function resolveGmailAddress(userId: string, connectedAccountId: string) {
  try {
    const address = await getConnectedGmailAddress(userId, connectedAccountId);

    return address ?? "";
  } catch (error) {
    console.error("[COMPOSIO_OAUTH] Failed to resolve connected Gmail address");
    console.error(error);

    return "";
  }
}

function deriveLabel(gmailAddress: string) {
  const localPart = gmailAddress.split("@")[0]?.trim();

  if (!localPart) {
    return "Gmail";
  }

  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

function getReturnUrl(
  request: Request,
  returnTo: string,
  gmailStatus: string,
  errorMessage?: string,
) {
  const url = new URL(returnTo, request.url);
  url.searchParams.set("gmail", gmailStatus);

  if (errorMessage) {
    url.searchParams.set("gmailError", errorMessage);
  }

  return url;
}
