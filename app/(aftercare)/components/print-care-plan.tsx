import { GuideDocument } from "@/app/(aftercare)/components/guide-document";
import { PoweredByAftercareGuide } from "@/app/(aftercare)/components/powered-by-aftercare-guide";
import { PracticeContact } from "@/app/(aftercare)/components/practice-contact";
import { PrintTrigger } from "@/app/(aftercare)/components/print-trigger";
import { DEMO_PRINT_SAMPLE_NOTICE } from "@/lib/aftercare/demo-tenant";
import type { PracticeChrome } from "@/lib/aftercare/practice-chrome";
import type { ComposedGuideSection } from "@/lib/aftercare/types";

import styles from "../patient.module.css";

export function PrintCarePlan({
  chrome,
  procedureTitle,
  instructionsLabel,
  sections,
  showDemoSample,
  guideHref,
}: {
  chrome: PracticeChrome;
  procedureTitle: string;
  instructionsLabel: string;
  sections: ComposedGuideSection[];
  showDemoSample: boolean;
  guideHref: string;
}) {
  return (
    <div
      className={`${styles.page} ${styles.printPage}`}
      data-print-care-plan=""
    >
      {showDemoSample ? (
        <p className={styles.printSample}>{DEMO_PRINT_SAMPLE_NOTICE}</p>
      ) : null}
      <header className={styles.printHeader}>
        <div className={styles.printBrand}>
          {chrome.logoSrc ? (
            <img
              className={styles.logo}
              src={chrome.logoSrc}
              alt=""
              width={44}
              height={44}
            />
          ) : null}
          <p className={styles.printClinic}>{chrome.displayName}</p>
        </div>
        <p className={styles.kicker}>{instructionsLabel}</p>
        <h1 className={styles.title}>{procedureTitle}</h1>
        <p className={styles.lede}>
          Care plan from {chrome.displayName}. Use your browser’s Print or Save
          as PDF. This page uses the same recovery information as the web guide.
        </p>
        <div className={styles.printActions}>
          <PrintTrigger label="Print / Save as PDF" />
          <a
            className={`${styles.action} ${styles.secondary} ${styles.printHide}`}
            href={guideHref}
          >
            Back to guide
          </a>
        </div>
      </header>
      <GuideDocument sections={sections} />
      <PracticeContact chrome={chrome} />
      {chrome.showCareGuideAttribution ? (
        <footer className={styles.footer}>
          <PoweredByAftercareGuide />
        </footer>
      ) : null}
    </div>
  );
}
