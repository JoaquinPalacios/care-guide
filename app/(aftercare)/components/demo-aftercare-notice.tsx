import { DEMO_AFTERCARE_NOTICE } from "@/lib/aftercare/demo-tenant";

import styles from "../patient.module.css";

export function DemoAftercareNotice() {
  return <p className={styles.notice}>{DEMO_AFTERCARE_NOTICE}</p>;
}
