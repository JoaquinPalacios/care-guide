import styles from "../marketing.module.css";

const DESKTOP_GUIDES = [
  "Tooth Extraction",
  "Dental Implant",
  "Root Canal",
] as const;

const PHONE_STAGES = [
  { period: "First few hours", title: "Immediate care" },
  { period: "Days 2–3", title: "Early recovery" },
  { period: "Days 4–7", title: "Healing check" },
] as const;

export function MarketingProductPreview() {
  return (
    <div className={styles.deviceStage} aria-hidden="true">
      <div className={styles.desktopPreview}>
        <div className={styles.desktopChrome}>
          <div className={styles.desktopBar}>
            <i />
            <i />
            <i />
          </div>
          <p className={styles.desktopChromeTitle}>Riverside Dental Demo</p>
        </div>
        <div className={styles.clinicScreen}>
          <div className={styles.clinicBrand}>
            <span className={styles.clinicMark} />
            Riverside Dental Demo
          </div>
          <p className={styles.clinicKicker}>Post-treatment instructions</p>
          <p className={styles.clinicTitle}>Recovery guides</p>
          <div className={styles.clinicGuideList}>
            {DESKTOP_GUIDES.map((title) => (
              <p key={title} className={styles.clinicGuide}>
                <span>{title}</span>
                <span className={styles.clinicGuideArrow}>→</span>
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.mobilePreview}>
        <div className={styles.phoneScreen}>
          <p className={styles.phoneClinic}>Riverside Dental Demo</p>
          <p className={styles.phoneTitle}>Tooth Extraction</p>
          <p className={styles.phoneKicker}>Post-treatment instructions</p>
          <p className={styles.phoneRecovery}>Recovery</p>
          <div className={styles.phoneTimeline}>
            {PHONE_STAGES.map((stage) => (
              <div key={stage.period} className={styles.phoneStage}>
                <p className={styles.phonePeriod}>{stage.period}</p>
                <p className={styles.phoneStageTitle}>{stage.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
