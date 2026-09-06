import { PRODUCT_ATTRIBUTION } from "@/lib/branding/product-name";

import styles from "../patient.module.css";

export function PoweredByAftercareGuide() {
  return <p className={styles.attribution}>{PRODUCT_ATTRIBUTION}</p>;
}
