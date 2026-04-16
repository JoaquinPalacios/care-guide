import "server-only";

import { randomUUID } from "node:crypto";

import { ClinicMembershipRole } from "@prisma/client";
import { cache } from "react";

import { auth } from "@/auth";
import { AUTH_SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session-cookie";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
}

export interface ClinicMembershipContext {
  membershipId: string;
  role: ClinicMembershipRole;
  clinic: {
    id: string;
    name: string;
  };
}

export interface AuthContext {
  user: AuthenticatedUser | null;
  clinicMembership: ClinicMembershipContext | null;
}

export interface DatabaseSessionRecord {
  sessionToken: string;
  expires: Date;
}

export class MultipleClinicMembershipsError extends Error {
  constructor(userId: string, clinicIds: string[]) {
    super(
      `Expected exactly one effective clinic membership for user "${userId}" during MVP auth resolution, but found memberships for clinics: ${clinicIds.join(", ")}.`
    );
    this.name = "MultipleClinicMembershipsError";
  }
}

export async function createDatabaseSession(
  userId: string
): Promise<DatabaseSessionRecord> {
  return prisma.session.create({
    data: {
      sessionToken: randomUUID(),
      userId,
      expires: new Date(Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000),
    },
    select: {
      sessionToken: true,
      expires: true,
    },
  });
}

export async function deleteDatabaseSession(sessionToken: string) {
  await prisma.session.deleteMany({
    where: { sessionToken },
  });
}

export const getCurrentUser = cache(
  async (): Promise<AuthenticatedUser | null> => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return null;
    }

    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }
);

export const getCurrentClinicMembership = cache(
  async (): Promise<ClinicMembershipContext | null> => {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    const memberships = await prisma.clinicMembership.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        role: true,
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (memberships.length === 0) {
      return null;
    }

    if (memberships.length > 1) {
      throw new MultipleClinicMembershipsError(
        user.id,
        memberships.map((membership) => membership.clinic.id)
      );
    }

    const [membership] = memberships;

    return {
      membershipId: membership.id,
      role: membership.role,
      clinic: membership.clinic,
    };
  }
);

export const getAuthContext = cache(async (): Promise<AuthContext> => {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      clinicMembership: null,
    };
  }

  return {
    user,
    clinicMembership: await getCurrentClinicMembership(),
  };
});
