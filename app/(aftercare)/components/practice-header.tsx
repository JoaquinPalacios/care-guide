import type { PracticeChrome } from "@/lib/aftercare/practice-chrome";

import styles from "../patient.module.css";

export function PracticeHeader({ chrome }: { chrome: PracticeChrome }) {
  return (
    <header className={styles.header}>
      <div className={`${styles.headerInner} ${styles.shell}`}>
        <a href="/" className={styles.brand}>
          {chrome.logoSrc ? (
            <img
              className={styles.logo}
              src={chrome.logoSrc}
              alt=""
              width={44}
              height={44}
            />
          ) : null}
          <span className={styles.name}>{chrome.displayName}</span>
        </a>
        {chrome.allowPatientThemeToggle ? (
          <span className={styles.themeSpacer} aria-hidden="true" />
        ) : null}
      </div>
    </header>
  );
}
