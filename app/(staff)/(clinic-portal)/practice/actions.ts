"use server";

import { requireClinicAdmin } from "@/lib/auth/require-clinic-admin";
import {
  removeClinicLogo,
  uploadClinicLogo,
} from "@/lib/clinic-assets/mutate-clinic-logo";
import { ClinicAssetStorageUnavailableError } from "@/lib/clinic-assets/supabase-clinic-asset-storage";
import { isClinicPortalError } from "@/lib/clinic-portal/errors";
import { practiceSettingsSchema } from "@/lib/clinic-portal/practice-settings-schema";
import { updatePracticeSettings } from "@/lib/clinic-portal/update-practice-settings";

export interface PracticeActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
  saved?: boolean;
}

export interface ClinicLogoActionState {
  error?: string;
  logoUrl?: string | null;
  ok?: boolean;
}

function practiceError(error: unknown): string {
  if (error instanceof ClinicAssetStorageUnavailableError) {
    return error.message;
  }
  if (isClinicPortalError(error)) {
    return error.message;
  }
  return "Could not save practice settings.";
}

function logoError(error: unknown): string {
  if (error instanceof ClinicAssetStorageUnavailableError) {
    return error.message;
  }
  if (isClinicPortalError(error)) {
    return error.message;
  }
  return "Could not update the clinic logo.";
}

export async function savePracticeSettingsAction(
  _previous: PracticeActionState,
  formData: FormData
): Promise<PracticeActionState> {
  const { clinicMembership } = await requireClinicAdmin();
  const parsed = practiceSettingsSchema.safeParse({
    displayName: formData.get("displayName") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
    primaryColor: formData.get("primaryColor") ?? "",
    accentColor: formData.get("accentColor") ?? "",
    neutralColor: formData.get("neutralColor") ?? "",
    radiusPreset: formData.get("radiusPreset") ?? "MEDIUM",
    instructionTerminology:
      formData.get("instructionTerminology") ?? "AFTERCARE",
    themeMode: formData.get("themeMode") ?? "SYSTEM",
    allowPatientThemeToggle: formData.get("allowPatientThemeToggle") === "on",
    phone: formData.get("phone") ?? "",
    contactUrl: formData.get("contactUrl") ?? "",
    addressLine1: formData.get("addressLine1") ?? "",
    addressLine2: formData.get("addressLine2") ?? "",
    city: formData.get("city") ?? "",
    region: formData.get("region") ?? "",
    postalCode: formData.get("postalCode") ?? "",
    emergencyInstructions: formData.get("emergencyInstructions") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { error: "Please review the practice settings.", fieldErrors };
  }

  try {
    await updatePracticeSettings({
      clinicId: clinicMembership.clinic.id,
      values: parsed.data,
    });
    return { saved: true };
  } catch (error) {
    return { error: practiceError(error) };
  }
}

export async function uploadClinicLogoAction(
  _previous: ClinicLogoActionState,
  formData: FormData
): Promise<ClinicLogoActionState> {
  const { clinicMembership } = await requireClinicAdmin();
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a PNG, JPEG, WebP, or SVG image." };
  }

  try {
    const uploaded = await uploadClinicLogo({
      actorRole: clinicMembership.role,
      actorClinicId: clinicMembership.clinic.id,
      targetClinicId: clinicMembership.clinic.id,
      bytes: new Uint8Array(await file.arrayBuffer()),
      mimeType: file.type,
      fileName: file.name,
    });
    return { ok: true, logoUrl: uploaded.logoUrl };
  } catch (error) {
    return { error: logoError(error) };
  }
}

export async function removeClinicLogoAction(
  _previous: ClinicLogoActionState,
  _formData: FormData
): Promise<ClinicLogoActionState> {
  const { clinicMembership } = await requireClinicAdmin();
  try {
    await removeClinicLogo({
      actorRole: clinicMembership.role,
      actorClinicId: clinicMembership.clinic.id,
      targetClinicId: clinicMembership.clinic.id,
    });
    return { ok: true, logoUrl: null };
  } catch (error) {
    return { error: logoError(error) };
  }
}
