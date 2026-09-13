import type { ReactNode } from "react";

import {
  MARKETING_DEMO_CALL_LABEL,
  MARKETING_DEMO_CLINIC_NAME,
  MARKETING_DEMO_GUIDE_TITLE,
  MARKETING_DEMO_INSTRUCTIONS_LABEL,
  MARKETING_DEMO_RECOVERY_HEADING,
  MARKETING_DEMO_THEME_APPEARANCE,
  MARKETING_DEMO_THEME_SCOPE,
  MARKETING_DEMO_TIMELINE,
} from "@/lib/marketing/demo-patient-preview";

import styles from "../marketing.module.css";

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
 * Patient light/dark follows the active marketing appearance via
 * shared aftercare tokens (`data-patient-theme="portal"`). This does
 * not change ClinicProfile.themeMode.
 *
 * Later, compose a short WebM + MP4 loop inside PhoneScreen
 * (autoplay, muted, loop, playsInline, poster). Do not use GIF.
 * See docs/product/WORKING-MEMORY.md (Phase 1F.9).
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
  return (
    <div
      className={`${styles.phoneScreen} ${MARKETING_DEMO_THEME_SCOPE}`}
      data-patient-theme={MARKETING_DEMO_THEME_APPEARANCE}
      data-mk-patient-surface="phone"
    >
      {children}
    </div>
  );
}

function ProductPreviewScreen() {
  return (
    <>
      <div className={styles.phoneBrand}>
        <span className={styles.phoneMark} />
        {MARKETING_DEMO_CLINIC_NAME}
      </div>
      <p className={styles.phoneKicker}>{MARKETING_DEMO_INSTRUCTIONS_LABEL}</p>
      <p className={styles.phoneTitle}>{MARKETING_DEMO_GUIDE_TITLE}</p>
      <div className={styles.phoneRecovery}>
        <p className={styles.phoneRecoveryTitle}>
          {MARKETING_DEMO_RECOVERY_HEADING}
        </p>
        <div className={styles.phoneTimeline}>
          {MARKETING_DEMO_TIMELINE.map((stage) => {
            const current = stage.status === "current";
            return (
              <div
                key={stage.period}
                className={
                  current
                    ? `${styles.phoneStage} ${styles.phoneStageCurrent}`
                    : `${styles.phoneStage} ${styles.phoneStageUpcoming}`
                }
                data-status={stage.status}
              >
                <span className={styles.phoneStageRail} aria-hidden="true" />
                <div className={styles.phoneStageBody}>
                  <p className={styles.phonePeriod}>{stage.period}</p>
                  <p className={styles.phoneStageTitle}>{stage.title}</p>
                  {current ? (
                    <p className={styles.phoneStageStatus}>Current</p>
                  ) : null}
                  {current && "summary" in stage ? (
                    <p className={styles.phoneStageSummary}>{stage.summary}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.phoneHelp}>
        <p className={styles.phoneHelpLabel}>Questions about your recovery?</p>
        <p className={styles.phoneHelpAction}>{MARKETING_DEMO_CALL_LABEL}</p>
      </div>
    </>
  );
}
