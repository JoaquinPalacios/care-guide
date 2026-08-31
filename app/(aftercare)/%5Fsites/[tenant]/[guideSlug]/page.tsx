import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuideSection } from "@/app/(aftercare)/components/guide-section";
import { PatientPage } from "@/app/(aftercare)/components/patient-page";
import { getPublishedPracticeGuide } from "@/lib/aftercare/get-published-practice-guide";
import { resolvePracticeChrome } from "@/lib/aftercare/practice-chrome";
import {
  aftercarePageMetadata,
  publicTenantCanonicalUrl,
} from "@/lib/aftercare/tenant-metadata";

import styles from "../../../patient.module.css";

interface TenantGuidePageProps {
  params: Promise<{ tenant: string; guideSlug: string }>;
}

export async function generateMetadata({
  params,
}: TenantGuidePageProps): Promise<Metadata> {
  const { tenant, guideSlug } = await params;
  const document = await getPublishedPracticeGuide({
    clinicSlug: tenant,
    publicSlug: guideSlug,
  });

  if (!document) {
    return aftercarePageMetadata({
      title: "Aftercare",
      description: "Patient aftercare guides.",
    });
  }

  const displayName = document.profile?.displayName ?? document.clinic.name;

  return aftercarePageMetadata({
    title: `${document.template.title} · ${displayName}`,
    description: `${document.template.title} aftercare from ${displayName}.`,
    canonicalUrl: await publicTenantCanonicalUrl(
      `/${document.practiceGuide.publicSlug}`
    ),
  });
}

export default async function TenantGuidePage({
  params,
}: TenantGuidePageProps) {
  const { tenant, guideSlug } = await params;
  const document = await getPublishedPracticeGuide({
    clinicSlug: tenant,
    publicSlug: guideSlug,
  });

  if (!document) {
    notFound();
  }

  const chrome = resolvePracticeChrome({
    slug: document.clinic.slug,
    name: document.clinic.name,
    profile: document.profile,
  });

  return (
    <PatientPage chrome={chrome}>
      <p className={styles.kicker}>Aftercare guide</p>
      <h1 className={styles.title}>{document.template.title}</h1>
      <p className={styles.lede}>
        Recovery information from {chrome.displayName}. Use the sections below
        and contact the practice if you need help.
      </p>
      {document.sections.map((section) => (
        <GuideSection key={section.key} section={section} />
      ))}
    </PatientPage>
  );
}
