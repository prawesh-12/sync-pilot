import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { initiateGmailConnection } from "@/lib/composio";
import { sanitizeReturnTo } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const returnTo = sanitizeReturnTo(requestUrl.searchParams.get("returnTo"));
  const callback = new URL("/api/auth/composio/callback", request.url);
  callback.searchParams.set("returnTo", returnTo);
  const connection = await initiateGmailConnection(userId, callback.toString());

  if (!connection.redirectUrl) {
    return NextResponse.json(
      { error: "Composio did not return a redirect URL." },
      { status: 502 },
    );
  }

  return NextResponse.redirect(connection.redirectUrl);
}
