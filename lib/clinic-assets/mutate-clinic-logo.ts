import "server-only";

import { randomUUID } from "node:crypto";

import { authorizeClinicLogoMutation } from "@/lib/clinic-assets/authorize-clinic-logo";
import { getClinicAssetStorage } from "@/lib/clinic-assets/get-clinic-asset-storage";
import {
  clinicLogoObjectKey,
  storageKeyFromClinicLogoPath,
  validateClinicLogo,
} from "@/lib/clinic-assets/clinic-logo";
import { sanitizeClinicLogoSvg } from "@/lib/clinic-assets/sanitize-clinic-logo-svg";
import { ClinicAssetStorageUnavailableError } from "@/lib/clinic-assets/supabase-clinic-asset-storage";
import { ClinicPortalError } from "@/lib/clinic-portal/errors";
import { prisma } from "@/lib/prisma";

export async function uploadClinicLogo(input: {
  actorRole: "ADMIN" | "STAFF";
  actorClinicId: string;
  targetClinicId: string;
  bytes: Uint8Array;
  mimeType: string;
  fileName?: string;
}): Promise<{ logoUrl: string }> {
  const authorized = authorizeClinicLogoMutation({
    role: input.actorRole,
    actorClinicId: input.actorClinicId,
    targetClinicId: input.targetClinicId,
  });
  if (!authorized.ok) {
    throw new ClinicPortalError(
      "You do not have permission to change this clinic logo.",
      "forbidden"
    );
  }

  const storage = getClinicAssetStorage();
  if (!storage) {
    throw new ClinicAssetStorageUnavailableError(
      "Logo upload is unavailable because clinic object storage is not configured."
    );
  }

  const validated = validateClinicLogo({
    bytes: input.bytes,
    mimeType: input.mimeType,
    fileName: input.fileName,
  });
  if (!validated.ok) {
    throw new ClinicPortalError(validated.error, "invalid");
  }

  let bytes = input.bytes;
  let mimeType = validated.mimeType;
  if (validated.kind === "svg") {
    const sanitized = sanitizeClinicLogoSvg(input.bytes);
    if (!sanitized.ok) {
      throw new ClinicPortalError(sanitized.error, "invalid");
    }
    bytes = sanitized.bytes;
    mimeType = sanitized.mimeType;
  }

  const storageKey = clinicLogoObjectKey({
    clinicId: input.targetClinicId,
    objectId: randomUUID(),
    extension: validated.extension,
  });

  const uploaded = await storage.uploadLogo({
    clinicId: input.targetClinicId,
    storageKey,
    bytes,
    mimeType,
  });

  const previous = await prisma.clinicProfile.findUnique({
    where: { clinicId: input.targetClinicId },
    select: { logoUrl: true, displayName: true },
  });
  if (!previous) {
    throw new ClinicPortalError("Practice profile is missing.", "not_found");
  }

  await prisma.clinicProfile.update({
    where: { clinicId: input.targetClinicId },
    data: { logoUrl: uploaded.publicPath },
  });

  const previousKey = storageKeyFromClinicLogoPath(previous?.logoUrl);
  if (
    previousKey &&
    previousKey !== uploaded.storageKey &&
    previousKey.startsWith(`clinics/${input.targetClinicId}/branding/`)
  ) {
    try {
      await storage.deleteLogo({
        clinicId: input.targetClinicId,
        storageKey: previousKey,
      });
    } catch {
      // Replacement succeeded; leftover objects can be cleaned later.
    }
  }

  return { logoUrl: uploaded.publicPath };
}

export async function removeClinicLogo(input: {
  actorRole: "ADMIN" | "STAFF";
  actorClinicId: string;
  targetClinicId: string;
}): Promise<void> {
  const authorized = authorizeClinicLogoMutation({
    role: input.actorRole,
    actorClinicId: input.actorClinicId,
    targetClinicId: input.targetClinicId,
  });
  if (!authorized.ok) {
    throw new ClinicPortalError(
      "You do not have permission to change this clinic logo.",
      "forbidden"
    );
  }

  const storage = getClinicAssetStorage();
  if (!storage) {
    throw new ClinicAssetStorageUnavailableError(
      "Logo upload is unavailable because clinic object storage is not configured."
    );
  }

  const previous = await prisma.clinicProfile.findUnique({
    where: { clinicId: input.targetClinicId },
    select: { logoUrl: true },
  });
  if (!previous) {
    throw new ClinicPortalError("Practice profile is missing.", "not_found");
  }

  await prisma.clinicProfile.update({
    where: { clinicId: input.targetClinicId },
    data: { logoUrl: null },
  });

  const previousKey = storageKeyFromClinicLogoPath(previous?.logoUrl);
  if (
    previousKey &&
    previousKey.startsWith(`clinics/${input.targetClinicId}/branding/`)
  ) {
    try {
      await storage.deleteLogo({
        clinicId: input.targetClinicId,
        storageKey: previousKey,
      });
    } catch {
      // Profile no longer references the object.
    }
  }
}
