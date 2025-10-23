import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

const missing = (key: string) =>
  !process.env[key] ? console.warn(`[auth] Missing environment variable ${key}. OAuth login may fail.`) : null;

missing("GOOGLE_CLIENT_ID");
missing("GOOGLE_CLIENT_SECRET");
missing("GITHUB_CLIENT_ID");
missing("GITHUB_CLIENT_SECRET");
missing("NEXTAUTH_SECRET");

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.provider = token.iss ?? "";
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
