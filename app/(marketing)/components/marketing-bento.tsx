import styles from "../marketing.module.css";

const FEATURES = [
  {
    key: "presence",
    span: "bentoLarge",
    title: "Clinic-first presence",
    copy: "Patients see the practice name, colours, and contact details — not a generic platform dashboard.",
  },
  {
    key: "reading",
    span: "bentoReading",
    title: "Mobile reading",
    copy: "Type, spacing, and actions are sized for a phone at home, not a waiting-room printout.",
  },
  {
    key: "urls",
    span: "bentoSmall",
    title: "Durable URLs",
    copy: "Stable addresses to share by link now, and later attach to a QR-ready handoff.",
  },
  {
    key: "contact",
    span: "bentoSmall",
    title: "Practice contact",
    copy: "Call from the same page. Urgent help stays distinct.",
  },
  {
    key: "library",
    span: "bentoLibrary",
    title: "Managed guide library",
    copy: "Enable reviewed recovery guides rather than assembling a website from scratch.",
  },
  {
    key: "custom",
    span: "bentoWide",
    title: "Controlled customisation",
    copy: "Clinics choose colour, accent, surface tone, radius, terminology, and theme policy. Arbitrary CSS is not part of the model.",
  },
] as const;

export function MarketingBento() {
  return (
    <div className={styles.bentoGrid} data-mk-bento="">
      {FEATURES.map((feature) => (
        <div
          key={feature.key}
          className={`${styles.bentoCard} ${styles[feature.span]}`}
          data-mk-bento-card=""
          data-mk-bento-span={feature.span}
        >
          <BentoVisual kind={feature.key} />
          <h3>{feature.title}</h3>
          <p>{feature.copy}</p>
        </div>
      ))}
    </div>
  );
}

function BentoVisual({ kind }: { kind: (typeof FEATURES)[number]["key"] }) {
  if (kind === "presence") {
    return (
      <div className={styles.microVisual} aria-hidden="true">
        <div className={styles.clinicMarkRow}>
          <span className={styles.clinicMark} />
          <span className={styles.clinicName} translate="no">
            Riverside Dental
          </span>
        </div>
        <div className={styles.microBrand}>
          <span className={`${styles.swatch} ${styles.swatchTeal}`} />
          <span className={`${styles.swatch} ${styles.swatchNavy}`} />
          <span className={`${styles.swatch} ${styles.swatchWarm}`} />
        </div>
      </div>
    );
  }

  if (kind === "reading") {
    return (
      <div
        className={`${styles.microVisual} ${styles.microPhone}`}
        aria-hidden="true"
      >
        <span className={styles.phoneOutline}>
          <span className={styles.typeLine} />
          <span className={`${styles.typeLine} ${styles.typeLineShort}`} />
          <span className={`${styles.typeLine} ${styles.typeLineMid}`} />
        </span>
      </div>
    );
  }

  if (kind === "urls") {
    return (
      <div className={styles.microVisual} aria-hidden="true">
        <span className={styles.urlStrip} translate="no">
          riverside.[your-domain]/extraction
        </span>
      </div>
    );
  }

  if (kind === "contact") {
    return (
      <div className={styles.microVisual} aria-hidden="true">
        <span className={styles.contactChip}>Call the practice →</span>
      </div>
    );
  }

  if (kind === "library") {
    return (
      <div className={styles.microVisual} aria-hidden="true">
        <span className={styles.guideRow}>Tooth Extraction</span>
        <span className={styles.guideRow}>Dental Implant</span>
        <span className={`${styles.guideRow} ${styles.guideRowQuiet}`}>
          Root Canal
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.microVisual} ${styles.microCustom}`}
      aria-hidden="true"
    >
      <div className={styles.microBrand}>
        <span className={`${styles.swatch} ${styles.swatchPrimary}`} />
        <span className={`${styles.swatch} ${styles.swatchAccent}`} />
      </div>
      <div className={styles.radiusRow}>
        <span className={`${styles.radiusChip} ${styles.radiusSharp}`}>
          Sharp
        </span>
        <span className={`${styles.radiusChip} ${styles.radiusMedium}`}>
          Medium
        </span>
        <span className={`${styles.radiusChip} ${styles.radiusSoft}`}>
          Soft
        </span>
      </div>
      <div className={styles.themeChips}>
        <span className={styles.themeChip}>Light</span>
        <span className={styles.themeChip}>Dark</span>
        <span className={`${styles.themeChip} ${styles.themeChipCurrent}`}>
          System
        </span>
      </div>
    </div>
  );
}
