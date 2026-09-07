import type { ReactNode } from "react";

import styles from "../marketing.module.css";

const PHONE_STAGES = [
  { period: "First few hours", title: "Immediate care" },
  { period: "Days 2–3", title: "Early recovery" },
  { period: "Days 4–7", title: "Healing check" },
] as const;

const IPHONE_FRAME = {
  src: "/marketing/iphone-frame.webp",
  width: 800,
  height: 1620,
} as const;

/**
 * Marketing product proof.
 *
 * Architecture (server-rendered; no video yet):
 *   PhoneShell → PhoneScreen → ProductPreviewScreen
 *
 * Device frame: Rivers Digital Catión case-study iPhone mockup
 * (Sanity `cationBlue.png`, 1450×2936 PNG with alpha). The screen
 * opening is transparent so this preview stays live HTML/CSS.
 *
 * Later, compose a short WebM + MP4 loop inside PhoneScreen
 * (autoplay, muted, loop, playsInline, poster). Do not use GIF.
 * See docs/product/WORKING-MEMORY.md (Phase 1F.8).
 */
export function MarketingProductPreview() {
  return (
    <div className={styles.deviceStage} aria-hidden="true">
      <PhoneShell>
        <PhoneScreen>
          <ProductPreviewScreen />
        </PhoneScreen>
      </PhoneShell>
    </div>
  );
}

function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.phoneShell}>
      {children}
      {/* Native img keeps this Server Component JS-free and out of LCP. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.phoneFrame}
        src={IPHONE_FRAME.src}
        alt=""
        width={IPHONE_FRAME.width}
        height={IPHONE_FRAME.height}
        fetchPriority="low"
        draggable={false}
      />
    </div>
  );
}

function PhoneScreen({ children }: { children: ReactNode }) {
  return <div className={styles.phoneScreen}>{children}</div>;
}

function ProductPreviewScreen() {
  return (
    <>
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
    </>
  );
}
