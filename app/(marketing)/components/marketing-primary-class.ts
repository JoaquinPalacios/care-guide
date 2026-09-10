import styles from "../marketing.module.css";

export function marketingPrimaryClassName(className?: string): string {
  return className
    ? `${styles.button} ${styles.primary} ${className}`
    : `${styles.button} ${styles.primary}`;
}
