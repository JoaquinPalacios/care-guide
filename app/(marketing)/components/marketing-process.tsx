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
    copy: "Patients receive a URL they can save. Designed for QR handoff later — not a dashboard in this release.",
    visual: "link",
  },
  {
    index: "Step 4",
    node: "04",
    title: "Patient revisits anytime",
    copy: "The same instructions stay available after the appointment, on a phone-sized layout.",
    visual: "revisit",
  },
] as const;

export function MarketingProcess() {
  return (
    <div className={styles.processJourney} data-mk-process="">
      <span
        className={styles.processRail}
        data-mk-process-rail=""
        aria-hidden="true"
      />
      <ol className={styles.processList}>
        {STEPS.map((step) => (
          <li
            key={step.node}
            className={styles.processStep}
            data-mk-process-card=""
          >
            <div className={styles.processTrack} aria-hidden="true">
              <span className={styles.processNode}>{step.node}</span>
              <span className={styles.processArrow} />
            </div>
            <div className={styles.processCard}>
              <ProcessVisual kind={step.visual} />
              <span className={styles.processIndex}>{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </div>
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
