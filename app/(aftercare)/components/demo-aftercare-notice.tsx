import {
  DEMO_BANNER_COPY,
  DEMO_BANNER_TITLE,
} from "@/lib/aftercare/demo-tenant";

import styles from "../patient.module.css";

export function DemoAftercareNotice() {
  return (
    <div className={styles.demoBanner} role="status">
      <p className={styles.demoBannerTitle}>{DEMO_BANNER_TITLE}</p>
      <p className={styles.demoBannerCopy}>{DEMO_BANNER_COPY}</p>
    </div>
  );
}
