import type { Metadata } from "next";
import { ClinicMembershipRole } from "@prisma/client";
import { notFound } from "next/navigation";

import { GuideDocument } from "@/app/(aftercare)/components/guide-document";
import { PatientPage } from "@/app/(aftercare)/components/patient-page";
import { StaffPreviewToolbar } from "@/app/(staff)/(guide-preview)/guides/[guideId]/preview/staff-preview-toolbar";
import { requireStaffSession } from "@/lib/auth/require-staff-session";
import { isClinicPortalError } from "@/lib/clinic-portal/errors";
import { loadPracticeGuideEditor } from "@/lib/clinic-portal/load-practice-guide-editor";
import { resolvePracticeChrome } from "@/lib/aftercare/practice-chrome";
import {
  AFTERCARE_THEME_SCOPE,
  resolveAftercareTheme,
  serializeAftercareThemeCss,
} from "@/lib/branding/aftercare-theme";
import { prisma } from "@/lib/prisma";
import { PRODUCT_NAME } from "@/lib/branding/product-name";

import styles from "@/app/(aftercare)/patient.module.css";

interface GuidePreviewPageProps {
  params: Promise<{ guideId: string }>;
}

export const metadata: Metadata = {
  title: `Draft preview · ${PRODUCT_NAME}`,
  robots: { index: false, follow: false },
};

export default async function GuidePreviewPage({
  params,
}: GuidePreviewPageProps) {
  const { guideId } = await params;
  const { clinicMembership } = await requireStaffSession();
  const canEdit = clinicMembership.role === ClinicMembershipRole.ADMIN;

  try {
    const [guide, clinic] = await Promise.all([
      loadPracticeGuideEditor({
        clinicId: clinicMembership.clinic.id,
        guideId,
      }),
      prisma.clinic.findUnique({
        where: { id: clinicMembership.clinic.id },
        select: {
          slug: true,
          name: true,
          profile: true,
        },
      }),
    ]);

    if (!clinic) {
      notFound();
    }

    const chrome = resolvePracticeChrome({
      slug: clinic.slug,
      name: clinic.name,
      profile: clinic.profile,
    });
    const theme = resolveAftercareTheme(clinic.profile);

    return (
      <div className="staffPreviewShell">
        <style
          dangerouslySetInnerHTML={{
            __html: `body{background:var(--staff-canvas);color:var(--staff-ink)}${serializeAftercareThemeCss(
              theme,
              {
                themeMode: clinic.profile?.themeMode,
                colorSchemeSelector: "scope",
              }
            )}`,
          }}
        />
        <StaffPreviewToolbar
          backHref={canEdit ? `/guides/${guide.id}/edit` : "/guides"}
          backLabel={canEdit ? "Back to guide" : "Back to guides"}
          editHref={canEdit ? `/guides/${guide.id}/edit` : undefined}
          lifecycle={guide.lifecycle}
        />
        <div className={AFTERCARE_THEME_SCOPE}>
          <PatientPage chrome={chrome}>
            <header className={styles.hero}>
              <p className={styles.kicker}>{chrome.instructionsLabel}</p>
              <h1 className={styles.title}>{guide.title}</h1>
              <p className={styles.lede}>
                {guide.introduction?.trim() ||
                  `Recovery information from ${chrome.displayName}. Read the sections below in order, and contact the practice if you are unsure or need help.`}
              </p>
            </header>
            <GuideDocument sections={guide.sections} />
          </PatientPage>
        </div>
      </div>
    );
  } catch (error) {
    if (isClinicPortalError(error) && error.code === "not_found") {
      notFound();
    }
    throw error;
  }
}
