import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getGoogleAuthorizationUrl } from "@/lib/agent/gmail";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.redirect(getGoogleAuthorizationUrl(userId));
}
