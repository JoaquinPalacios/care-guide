import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";
import {
  AUTH_SESSION_COOKIE_NAME,
  authSessionCookieOptions,
} from "@/lib/auth/session-cookie";

const authSecret = process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error(
    'Missing AUTH_SECRET. Copy ".env.example" to ".env" and set AUTH_SECRET before starting the app.'
  );
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  secret: authSecret,
  session: {
    strategy: "database",
  },
  providers: [],
  cookies: {
    sessionToken: {
      name: AUTH_SESSION_COOKIE_NAME,
      options: authSessionCookieOptions,
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (!session.user) {
        return session;
      }

      return {
        ...session,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    },
  },
});
