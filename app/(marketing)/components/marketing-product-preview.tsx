import type { ReactNode } from "react";

import styles from "../marketing.module.css";

const PHONE_STAGES = [
  { period: "First few hours", title: "Immediate care" },
  { period: "Days 2–3", title: "Early recovery" },
  { period: "Days 4–7", title: "Healing check" },
] as const;

/**
 * Marketing product proof.
 *
 * Architecture (server-rendered; no video yet):
 *   PhoneShell → PhoneScreen → ProductPreviewScreen
 *
 * Later, compose a short WebM + MP4 loop inside PhoneScreen
 * (autoplay, muted, loop, playsInline, poster). Do not use GIF.
 * See docs/product/WORKING-MEMORY.md (Phase 1F.7).
 */
export function MarketingProductPreview() {
  return (
    <div className={styles.deviceStage} aria-hidden="true">
      <PhoneShell>
        <ProductPreviewScreen />
      </PhoneShell>
    </div>
  );
}

function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.phoneShell}>
      <div className={styles.phoneBezel}>
        <span className={styles.phoneIsland} />
        <div className={styles.phoneGlass}>{children}</div>
      </div>
    </div>
  );
}

function PhoneScreen({ children }: { children: ReactNode }) {
  return <div className={styles.phoneScreen}>{children}</div>;
}

function ProductPreviewScreen() {
  return (
    <PhoneScreen>
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
    </PhoneScreen>
  );
}
