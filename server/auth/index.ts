import NextAuth, {  DefaultSession, getServerSession as getServerSessionNextAuth } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/server/db/db"

export const authOptions = {
  adapter: DrizzleAdapter(db),
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }: { session: DefaultSession; user: { id: string } }) {
      if (session.user && user) {
        (session.user as { id: string }).id = user.id;
      }

      return session;
    },
  },
}
export function getServerSession() {
  return getServerSessionNextAuth(authOptions)
}