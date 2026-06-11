import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Comma-separated list of admin emails in env var
// e.g. ADMIN_EMAILS=valerijs.salcevics@id.thesoul.io,other@id.thesoul.io
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return user.email?.endsWith("@id.thesoul.io") ?? false;
    },
    async session({ session }) {
      session.user.role = ADMIN_EMAILS.includes(session.user.email) ? "admin" : "user";
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);
