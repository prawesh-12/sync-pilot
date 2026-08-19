import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export default async function Page() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="sp-surface-1 mx-auto flex w-full max-w-sm flex-col items-center gap-6 px-6 py-10 text-center">
      <div className="space-y-1">
        <h1 className="sp-h3 text-sp-text">Sign in to SyncPilot</h1>
        <p className="sp-body text-sp-muted">
          Continue with your Google account to access your dashboard.
        </p>
      </div>
      <GoogleSignInButton />
    </div>
  );
}
