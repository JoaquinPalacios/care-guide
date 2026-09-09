"use client";

import { MarketingRevealItem } from "@/app/(marketing)/components/marketing-reveal";
import {
  cardRevealItemVariants,
  nodeRevealItemVariants,
  railRevealVariants,
} from "@/lib/marketing/reveal-variants";

import styles from "../marketing.module.css";

const STEPS = [
  {
    index: "Step 1",
    node: "01",
    title: "Select guides",
    copy: "The clinic enables the recovery guides that match the care it provides.",
    visual: "guides",
  },
  {
    index: "Step 2",
    node: "02",
    title: "Apply clinic brand",
    copy: "Colour, logo, terminology, and a controlled visual tone make the pages feel like the practice.",
    visual: "brand",
  },
  {
    index: "Step 3",
    node: "03",
    title: "Share a durable link",
    copy: "Patients receive a stable URL they can save and reopen whenever they need it.",
    visual: "link",
  },
  {
    index: "Step 4",
    node: "04",
    title: "Patient revisits anytime",
    copy: "The same instructions stay available after the appointment, designed for clear reading on a phone.",
    visual: "revisit",
  },
] as const;

const CARD_START = 0.22;
const CARD_STAGGER = 0.08;
const CONNECTOR_OFFSET = 0.04;
const NODE_START = 0.16;

export function MarketingProcess() {
  return (
    <div className={styles.processJourney} data-mk-process="">
      <MarketingRevealItem
        as="span"
        delay={0.14}
        variants={railRevealVariants}
        className={styles.processRail}
        rail
      >
        <span className={styles.processRailMark} />
        <span className={styles.processRailMark} />
        <span className={styles.processRailMark} />
      </MarketingRevealItem>
      <ol className={styles.processList}>
        {STEPS.map((step, index) => (
          <li
            key={step.node}
            className={styles.processStep}
            data-mk-process-card=""
          >
            <MarketingRevealItem
              delay={NODE_START + index * CARD_STAGGER}
              variants={nodeRevealItemVariants}
              className={styles.processTrack}
              ariaHidden
            >
              <span className={styles.processNode}>{step.node}</span>
            </MarketingRevealItem>
            <MarketingRevealItem
              delay={CARD_START + index * CARD_STAGGER}
              variants={cardRevealItemVariants}
              className={styles.processCard}
            >
              <div className={styles.processVisual}>
                <ProcessVisual kind={step.visual} />
              </div>
              <span className={styles.processIndex}>{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </MarketingRevealItem>
            {index < STEPS.length - 1 ? (
              <MarketingRevealItem
                as="span"
                delay={CARD_START + index * CARD_STAGGER + CONNECTOR_OFFSET}
                variants={cardRevealItemVariants}
                className={styles.processConnector}
                connector
              >
                <span className={styles.processConnectorLine} />
                <span className={styles.processConnectorArrow} />
              </MarketingRevealItem>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ProcessVisual({ kind }: { kind: (typeof STEPS)[number]["visual"] }) {
  if (kind === "guides") {
    return (
      <div className={styles.microVisual} aria-hidden="true">
        <span className={styles.guideBar} />
        <span className={`${styles.guideBar} ${styles.guideBarMid}`} />
        <span className={`${styles.guideBar} ${styles.guideBarShort}`} />
      </div>
    );
  }

  if (kind === "brand") {
    return (
      <div
        className={`${styles.microVisual} ${styles.microBrand}`}
        aria-hidden="true"
      >
        <span className={`${styles.swatch} ${styles.swatchTeal}`} />
        <span className={`${styles.swatch} ${styles.swatchNavy}`} />
        <span className={`${styles.swatch} ${styles.swatchWarm}`} />
        <span className={styles.radiusSample} />
      </div>
    );
  }

  if (kind === "link") {
    return (
      <div className={styles.microVisual} aria-hidden="true">
        <span className={styles.urlStrip} translate="no">
          riverside.[your-domain]/extraction
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.microVisual} ${styles.microTimeline}`}
      aria-hidden="true"
    >
      <span className={`${styles.timelineDot} ${styles.timelineDotCurrent}`} />
      <span className={styles.timelineRule} />
      <span className={styles.timelineDot} />
      <span className={styles.timelineRule} />
      <span className={`${styles.timelineDot} ${styles.timelineDotDone}`} />
    </div>
  );
}
