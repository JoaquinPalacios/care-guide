import { NextResponse } from "next/server";
import { PlatformRole } from "@prisma/client";

import { verifyPassword } from "@/lib/auth/password";
import {
  AUTH_SESSION_COOKIE_NAME,
  authSessionCookieOptions,
} from "@/lib/auth/session-cookie";
import { createDatabaseSession, postLoginPath } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Expected a JSON body with email and password." },
      { status: 400 }
    );
  }

  const email =
    typeof (body as { email?: unknown })?.email === "string"
      ? (body as { email: string }).email.trim().toLowerCase()
      : "";
  const password =
    typeof (body as { password?: unknown })?.password === "string"
      ? (body as { password: string }).password
      : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      platformRole: true,
    },
  });

  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 }
    );
  }

  const memberships = await prisma.clinicMembership.findMany({
    where: { userId: user.id },
    select: {
      clinicId: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (memberships.length === 0 && user.platformRole !== PlatformRole.OPERATOR) {
    return NextResponse.json(
      { error: "Your account does not have staff access yet." },
      { status: 403 }
    );
  }

  if (memberships.length > 1) {
    return NextResponse.json(
      {
        error:
          "Your account has multiple clinic memberships and cannot sign in to this MVP yet.",
      },
      { status: 409 }
    );
  }

  const session = await createDatabaseSession(user.id);
  const redirectTo = postLoginPath({
    platformRole: user.platformRole,
    hasClinicMembership: memberships.length === 1,
  });
  const response = NextResponse.json({
    redirectTo,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });

  response.cookies.set({
    ...authSessionCookieOptions,
    name: AUTH_SESSION_COOKIE_NAME,
    value: session.sessionToken,
    expires: session.expires,
  });

  return response;
}
