import "server-only";

import {
  mimeTypeForClinicLogoExtension,
  storageKeyFromClinicLogoPath,
} from "@/lib/clinic-assets/clinic-logo";
import { getClinicAssetStorage } from "@/lib/clinic-assets/get-clinic-asset-storage";

export const CLINIC_LOGO_RESPONSE_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Content-Disposition": "inline",
  "Cache-Control": "public, max-age=3600, immutable",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'; sandbox",
} as const;

export async function readClinicLogoObject(input: {
  clinicId: string;
  filename: string;
}): Promise<{ bytes: Uint8Array; mimeType: string } | null> {
  const publicPath = `/clinic-branding/${input.clinicId}/${input.filename}`;
  const storageKey = storageKeyFromClinicLogoPath(publicPath);
  if (!storageKey) {
    return null;
  }

  const storage = getClinicAssetStorage();
  if (!storage) {
    return null;
  }

  const stored = await storage.readLogo({
    clinicId: input.clinicId,
    storageKey,
  });
  if (!stored) {
    return null;
  }

  const extension = input.filename.split(".").pop() ?? "";
  const expected = mimeTypeForClinicLogoExtension(extension);
  if (!expected) {
    return null;
  }

  return {
    bytes: stored.bytes,
    mimeType: expected,
  };
}
