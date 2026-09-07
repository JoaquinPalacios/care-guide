import styles from "../marketing.module.css";

const PHONE_STAGES = [
  { period: "First few hours", title: "Immediate care" },
  { period: "Days 2–3", title: "Early recovery" },
  { period: "Days 4–7", title: "Healing check" },
] as const;

export function MarketingProductPreview() {
  return (
    <div className={styles.deviceStage} aria-hidden="true">
      <div className={styles.phonePreview}>
        <div className={styles.phoneBezel}>
          <span className={styles.phoneIsland} />
          <div className={styles.phoneGlass}>
            <div className={styles.phoneScreen}>
              <div className={styles.phoneBrand}>
                <span className={styles.phoneMark} />
                Riverside Dental Demo
              </div>
              <p className={styles.phoneTitle}>Tooth Extraction</p>
              <p className={styles.phoneKicker}>Post-treatment instructions</p>
              <p className={styles.phoneRecovery}>Recovery guide</p>
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
      </div>
    </div>
  );
}
