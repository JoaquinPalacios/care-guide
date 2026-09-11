"use server";

import { redirect } from "next/navigation";

import { requireClinicAdmin } from "@/lib/auth/require-clinic-admin";
import { fieldErrorsFromZod } from "@/lib/clinic-portal/field-errors";
import {
  createCustomPracticeGuide,
  createPracticeGuideFromTemplate,
} from "@/lib/clinic-portal/create-practice-guide";
import { isClinicPortalError } from "@/lib/clinic-portal/errors";
import {
  createCustomGuideSchema,
  createTemplateGuideSchema,
  saveGuideDraftSchema,
} from "@/lib/clinic-portal/guide-schemas";
import { deleteUnpublishedPracticeGuide } from "@/lib/clinic-portal/delete-practice-guide";
import { discardPracticeGuideDraft } from "@/lib/clinic-portal/discard-practice-guide-draft";
import { publishPracticeGuide } from "@/lib/clinic-portal/publish-practice-guide";
import { savePracticeGuideDraft } from "@/lib/clinic-portal/save-practice-guide-draft";

export interface GuideActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
}

function errorState(error: unknown): GuideActionState {
  if (isClinicPortalError(error)) {
    return { error: error.message };
  }

  return { error: "Something went wrong. Try again." };
}

export async function createGuideFromTemplateAction(
  _previous: GuideActionState,
  formData: FormData
): Promise<GuideActionState> {
  const { user, clinicMembership } = await requireClinicAdmin();
  const parsed = createTemplateGuideSchema.safeParse({
    templateId: formData.get("templateId") ?? "",
    publicSlug: formData.get("publicSlug") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Choose a template.",
    };
  }

  try {
    const created = await createPracticeGuideFromTemplate({
      clinicId: clinicMembership.clinic.id,
      actorUserId: user.id,
      values: parsed.data,
    });
    redirect(`/guides/${created.id}/edit`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return errorState(error);
  }
}

export async function createCustomGuideAction(
  _previous: GuideActionState,
  formData: FormData
): Promise<GuideActionState> {
  const { user, clinicMembership } = await requireClinicAdmin();
  const parsed = createCustomGuideSchema.safeParse({
    title: formData.get("title") ?? "",
    publicSlug: formData.get("publicSlug") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { error: "Please review the form and try again.", fieldErrors };
  }

  try {
    const created = await createCustomPracticeGuide({
      clinicId: clinicMembership.clinic.id,
      actorUserId: user.id,
      values: parsed.data,
    });
    redirect(`/guides/${created.id}/edit`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return errorState(error);
  }
}

export async function saveGuideDraftAction(
  _previous: GuideActionState,
  formData: FormData
): Promise<GuideActionState> {
  const { user, clinicMembership } = await requireClinicAdmin();
  const rawSections = formData.get("sections");
  let sections: unknown = [];
  if (typeof rawSections === "string") {
    try {
      sections = JSON.parse(rawSections);
    } catch {
      return { error: "The guide draft could not be read. Try again." };
    }
  }

  const parsed = saveGuideDraftSchema.safeParse({
    guideId: formData.get("guideId") ?? "",
    title: formData.get("title") ?? "",
    publicSlug: formData.get("publicSlug") ?? "",
    introduction: formData.get("introduction") ?? "",
    sections,
  });

  if (!parsed.success) {
    return {
      error: "Please review the form and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await savePracticeGuideDraft({
      clinicId: clinicMembership.clinic.id,
      actorUserId: user.id,
      values: parsed.data,
    });
    return { ok: true };
  } catch (error) {
    return errorState(error);
  }
}

export async function publishGuideAction(
  _previous: GuideActionState,
  formData: FormData
): Promise<GuideActionState> {
  const { user, clinicMembership } = await requireClinicAdmin();
  const guideId = String(formData.get("guideId") ?? "");
  if (!guideId) {
    return { error: "Missing guide." };
  }

  try {
    await publishPracticeGuide({
      clinicId: clinicMembership.clinic.id,
      actorUserId: user.id,
      guideId,
    });
    return { ok: true };
  } catch (error) {
    return errorState(error);
  }
}

export async function deleteGuideDraftAction(
  _previous: GuideActionState,
  formData: FormData
): Promise<GuideActionState> {
  const { clinicMembership } = await requireClinicAdmin();
  const guideId = String(formData.get("guideId") ?? "");
  if (!guideId) {
    return { error: "Missing guide." };
  }

  try {
    await deleteUnpublishedPracticeGuide({
      clinicId: clinicMembership.clinic.id,
      guideId,
    });
    redirect("/guides");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return errorState(error);
  }
}

export async function discardGuideDraftAction(
  _previous: GuideActionState,
  formData: FormData
): Promise<GuideActionState> {
  const { user, clinicMembership } = await requireClinicAdmin();
  const guideId = String(formData.get("guideId") ?? "");
  if (!guideId) {
    return { error: "Missing guide." };
  }

  try {
    await discardPracticeGuideDraft({
      clinicId: clinicMembership.clinic.id,
      actorUserId: user.id,
      guideId,
    });
    redirect("/guides");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return errorState(error);
  }
}

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}
