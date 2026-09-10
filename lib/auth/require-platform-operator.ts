import "server-only";

import { notFound, redirect } from "next/navigation";

import {
  type AuthenticatedUser,
  getAuthContext,
  isPlatformOperator,
} from "@/lib/auth/session";

export async function requirePlatformOperator(): Promise<{
  user: AuthenticatedUser;
}> {
  const authContext = await getAuthContext();

  if (!authContext.user) {
    redirect("/login");
  }

  if (!isPlatformOperator(authContext.user)) {
    notFound();
  }

  return { user: authContext.user };
}
