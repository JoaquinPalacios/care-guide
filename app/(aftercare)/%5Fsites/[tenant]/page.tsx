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
      title: "Post-operative instructions",
      description: "Patient post-operative instructions.",
    });
  }

  const displayName = listed.profile?.displayName ?? listed.clinic.name;

  return aftercarePageMetadata({
    title: `${displayName} — Post-operative instructions`,
    description: `Post-operative instructions from ${displayName}. Revisit this page after treatment for practice-branded recovery information.`,
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
      <header className={styles.hero}>
        <p className={styles.kicker}>Aftercare</p>
        <h1 className={styles.title}>
          {chrome.displayName} — Post-operative instructions
        </h1>
        <p className={styles.lede}>
          Clear recovery information from {chrome.displayName}. Open a guide if
          you have just had treatment, or return to this page whenever you need
          to check what to do next.
        </p>
      </header>
      <GuideList guides={listed.guides} />
    </PatientPage>
  );
}
