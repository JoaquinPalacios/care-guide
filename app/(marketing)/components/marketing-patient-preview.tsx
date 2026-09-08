import styles from "../marketing.module.css";

export function MarketingPatientPreview() {
  return (
    <div className={styles.previewStage}>
      <div
        className={styles.patientHomePreview}
        data-mk-patient-preview=""
        aria-hidden="true"
      >
        <p className={styles.patientViewKicker}>Patient view</p>
        <div className={styles.patientHomeCard}>
          <p className={styles.patientHomeClinic} translate="no">
            Riverside Dental Demo
          </p>
          <p className={styles.patientHomeTerm}>Post-treatment instructions</p>
          <p className={styles.patientHomeGuide}>
            Tooth Extraction
            <span className={styles.patientHomeArrow}>→</span>
          </p>
          <p className={styles.patientHomeContact}>Call the practice</p>
        </div>
      </div>
      <p className={styles.previewCaption}>
        No login, no feed — just the recovery information patients need, with
        the practice still one tap away.
      </p>
    </div>
  );
}
