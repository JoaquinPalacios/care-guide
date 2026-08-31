import type { PracticeChrome } from "@/lib/aftercare/practice-chrome";

import styles from "../patient.module.css";

export function PracticeHeader({ chrome }: { chrome: PracticeChrome }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a href="/" className={styles.brand}>
          {chrome.logoSrc ? (
            <img
              className={styles.logo}
              src={chrome.logoSrc}
              alt=""
              width={40}
              height={40}
            />
          ) : null}
          <span className={styles.name}>{chrome.displayName}</span>
        </a>
      </div>
    </header>
  );
}
