"use client";

import styles from "../patient.module.css";

export function PrintTrigger({ label }: { label: string }) {
  return (
    <button
      type="button"
      className={`${styles.action} ${styles.primary} ${styles.printHide}`}
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}
