import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";
import {
  AUTH_SESSION_COOKIE_NAME,
  authSessionCookieOptions,
} from "@/lib/auth/session-cookie";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
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
