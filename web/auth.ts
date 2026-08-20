import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { resolveUserIdByEmail } from "@/db/queries/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [Google],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    // Sign in gives a new random id every time, so use the saved one.
    async jwt({ token, account, profile }) {
      if (account && profile?.email && token.sub) {
        token.sub = await resolveUserIdByEmail(profile.email, token.sub);
      }

      return token;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
});
