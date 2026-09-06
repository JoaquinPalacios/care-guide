import type { ReactNode } from "react";

import { DemoAftercareNotice } from "@/app/(aftercare)/components/demo-aftercare-notice";
import { PoweredByAftercareGuide } from "@/app/(aftercare)/components/powered-by-aftercare-guide";
import { PracticeContact } from "@/app/(aftercare)/components/practice-contact";
import { PracticeHeader } from "@/app/(aftercare)/components/practice-header";
import type { PracticeChrome } from "@/lib/aftercare/practice-chrome";

import styles from "../patient.module.css";

export function PatientPage({
  chrome,
  children,
}: {
  chrome: PracticeChrome;
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <PracticeHeader chrome={chrome} />
      <main className={`${styles.main} ${styles.shell}`}>
        {chrome.showDemoNotice ? <DemoAftercareNotice /> : null}
        {children}
        <PracticeContact chrome={chrome} />
      </main>
      {chrome.showCareGuideAttribution ? (
        <footer className={`${styles.footer} ${styles.shell}`}>
          <PoweredByAftercareGuide />
        </footer>
      ) : null}
    </div>
  );
}
