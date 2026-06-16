import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export default async function Page() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-[#A089E6]/15 bg-white/4 px-6 py-10 text-center">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Sign in to SyncPilot</h1>
        <p className="text-sm text-gray-400">
          Continue with your Google account to access your dashboard.
        </p>
      </div>
      <GoogleSignInButton />
    </div>
  );
}
