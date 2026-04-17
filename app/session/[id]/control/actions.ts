"use server";

import { notFound, redirect } from "next/navigation";

import { requireStaffSession } from "@/lib/auth/require-staff-session";
import { completeProcedureSession } from "@/lib/sessions/complete-procedure-session";
import { SessionNotFoundError } from "@/lib/sessions/errors";

export async function completeSessionAction(formData: FormData): Promise<void> {
  const { clinicMembership } = await requireStaffSession();

  if (!clinicMembership) {
    notFound();
  }

  const sessionId = formData.get("sessionId");

  if (typeof sessionId !== "string" || sessionId.length === 0) {
    notFound();
  }

  try {
    await completeProcedureSession({
      sessionId,
      clinicId: clinicMembership.clinic.id,
    });
  } catch (error) {
    if (error instanceof SessionNotFoundError) {
      notFound();
    }

    throw error;
  }

  redirect("/dashboard");
}
