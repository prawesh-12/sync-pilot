import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/features/gmail/gmail";
import { getIntegration, saveIntegration, upsertUser } from "@/db/queries";
import { encrypt } from "@/lib/encryption";

const GMAIL_CONNECTED_STATUS = "connected";
const GMAIL_FAILED_STATUS = "failed";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress;
    const searchParams = new URL(request.url).searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!email || !code || state !== userId) {
      throw new Error("Invalid Google OAuth callback.");
    }

    const tokens = await exchangeGoogleCode(code);
    const existingIntegration = await getIntegration(userId);
    const accessToken = tokens.access_token?.trim();
    const refreshTokenEncrypted = getRefreshTokenEncrypted(
      tokens.refresh_token?.trim(),
      existingIntegration?.refreshTokenEncrypted,
    );

    if (!accessToken || !refreshTokenEncrypted) {
      throw new Error("Google OAuth tokens were incomplete.");
    }

    await upsertUser({ id: userId, email });
    await saveIntegration(userId, {
      accessTokenEncrypted: encrypt(accessToken),
      refreshTokenEncrypted,
    });

    return NextResponse.redirect(getDashboardUrl(request, GMAIL_CONNECTED_STATUS));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Google OAuth callback failed.";

    console.error("[GOOGLE_OAUTH] Callback failed");
    console.error(error);

    return NextResponse.redirect(
      getDashboardUrl(request, GMAIL_FAILED_STATUS, message),
    );
  }
}

function getRefreshTokenEncrypted(
  refreshToken: string | undefined,
  existingRefreshTokenEncrypted: string | undefined,
) {
  if (refreshToken) {
    return encrypt(refreshToken);
  }

  return existingRefreshTokenEncrypted ?? "";
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
