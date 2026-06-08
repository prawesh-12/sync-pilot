import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { initiateGmailConnection } from "@/lib/composio";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const callbackUrl = new URL(
    "/api/auth/composio/callback",
    request.url,
  ).toString();
  const connection = await initiateGmailConnection(userId, callbackUrl);

  if (!connection.redirectUrl) {
    return NextResponse.json(
      { error: "Composio did not return a redirect URL." },
      { status: 502 },
    );
  }

  return NextResponse.redirect(connection.redirectUrl);
}
