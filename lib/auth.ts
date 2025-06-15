import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.readonly",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
    signOut: "/",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account }) {
      // Save the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        // these tokens are created by google and are used to access the user's gmail
        token.accessToken = account.access_token as string;
        token.refreshToken = account.refresh_token as string;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token.refreshToken) {
        session.refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },
});

// Type declarations for NextAuth
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
  }
}
