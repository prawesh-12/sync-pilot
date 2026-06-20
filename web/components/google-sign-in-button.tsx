import { signIn } from "@/auth";
import { GoogleSignInSubmit } from "@/components/google-sign-in-submit";

type GoogleSignInButtonProps = {
  label?: string;
  redirectTo?: string;
};

export function GoogleSignInButton({
  label = "Continue with Google",
  redirectTo = "/dashboard",
}: GoogleSignInButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo });
      }}
    >
      <GoogleSignInSubmit label={label} />
    </form>
  );
}
