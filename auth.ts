import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";

import { getPrisma } from "@/lib/prisma";
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

function createPrismaAuthAdapter() {
  return PrismaAdapter({
    get user() {
      return getPrisma().user;
    },
    get account() {
      return getPrisma().account;
    },
    get session() {
      return getPrisma().session;
    },
    get verificationToken() {
      return getPrisma().verificationToken;
    },
  } as unknown as PrismaClient);
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: createPrismaAuthAdapter(),
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
