import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuideList } from "@/app/(aftercare)/components/guide-list";
import { PatientPage } from "@/app/(aftercare)/components/patient-page";
import { listPublishedPracticeGuides } from "@/lib/aftercare/list-published-practice-guides";
import { resolvePracticeChrome } from "@/lib/aftercare/practice-chrome";
import {
  aftercarePageMetadata,
  publicTenantCanonicalUrl,
} from "@/lib/aftercare/tenant-metadata";

import styles from "../../patient.module.css";

interface TenantHomePageProps {
  params: Promise<{ tenant: string }>;
}

export async function generateMetadata({
  params,
}: TenantHomePageProps): Promise<Metadata> {
  const { tenant } = await params;
  const listed = await listPublishedPracticeGuides(tenant);

  if (!listed) {
    return aftercarePageMetadata({
      title: "Aftercare",
      description: "Patient aftercare guides.",
    });
  }

  const displayName = listed.profile?.displayName ?? listed.clinic.name;

  return aftercarePageMetadata({
    title: `${displayName} Aftercare`,
    description: `Aftercare guides from ${displayName}. Revisit this page after treatment for practice-branded recovery information.`,
    canonicalUrl: await publicTenantCanonicalUrl("/"),
  });
}

export default async function TenantHomePage({ params }: TenantHomePageProps) {
  const { tenant } = await params;
  const listed = await listPublishedPracticeGuides(tenant);

  if (!listed) {
    notFound();
  }

  const chrome = resolvePracticeChrome({
    slug: listed.clinic.slug,
    name: listed.clinic.name,
    profile: listed.profile,
  });

  return (
    <PatientPage chrome={chrome}>
      <p className={styles.kicker}>Aftercare</p>
      <h1 className={styles.title}>Aftercare guides</h1>
      <p className={styles.lede}>
        Information to revisit after treatment from {chrome.displayName}. These
        guides stay available on this page whenever you need them.
      </p>
      <GuideList guides={listed.guides} />
    </PatientPage>
  );
}
