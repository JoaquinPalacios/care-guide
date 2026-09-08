import styles from "../marketing.module.css";

const PILLARS = [
  {
    key: "clinic",
    title: "Looks like your clinic",
    copy: "Patients land on a clinic-first page — name, colours, terminology, and tone — not a generic platform shell.",
    points: [
      "Primary and accent colours stay with the practice.",
      "Instruction wording and theme follow clinic settings.",
      "Corners and chrome use controlled presets, not arbitrary CSS.",
    ],
  },
  {
    key: "patients",
    title: "Built for patients",
    copy: "The page is meant to be reopened at home on a phone, with the same instructions and a way to reach the practice.",
    points: [
      "Type and spacing are sized for mobile reading.",
      "Durable URLs stay available after the appointment.",
      "Practice contact sits on the same aftercare page.",
    ],
  },
  {
    key: "operate",
    title: "Simple to operate",
    copy: "Clinics enable reviewed recovery guides instead of assembling a website from scratch.",
    points: [
      "Turn on only the guides that match the care provided.",
      "Reuse approved content across visits.",
      "Designed for QR handoff and operator admin later — not in this release.",
    ],
  },
] as const;

export function MarketingPillars() {
  return (
    <div className={styles.pillarStack} data-mk-pillars="">
      <div className={styles.pillarGrid}>
        {PILLARS.map((pillar) => (
          <article
            key={pillar.key}
            className={styles.pillarCard}
            data-mk-pillar=""
          >
            <PillarVisual kind={pillar.key} />
            <h3>{pillar.title}</h3>
            <p>{pillar.copy}</p>
            <ul className={styles.pillarPoints}>
              {pillar.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className={styles.customStrip} data-mk-custom-strip="">
        <div className={styles.customCopy}>
          <h3>Controlled customisation</h3>
          <p>
            Fit the patient&apos;s page to the clinic without arbitrary CSS.
          </p>
        </div>
        <div className={styles.customGroup} aria-hidden="true">
          <p className={styles.customLabel}>Brand</p>
          <div className={styles.customSwatches}>
            <span className={styles.customSwatchItem}>
              <span className={`${styles.swatch} ${styles.swatchPrimary}`} />
              Primary
            </span>
            <span className={styles.customSwatchItem}>
              <span className={`${styles.swatch} ${styles.swatchAccent}`} />
              Accent
            </span>
          </div>
        </div>
        <div className={styles.customGroup} aria-hidden="true">
          <p className={styles.customLabel}>Corners</p>
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
        </div>
        <div className={styles.customGroup} aria-hidden="true">
          <p className={styles.customLabel}>Appearance</p>
          <div className={styles.themeChips}>
            <span className={styles.themeChip}>Light</span>
            <span className={styles.themeChip}>Dark</span>
            <span className={`${styles.themeChip} ${styles.themeChipCurrent}`}>
              System
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PillarVisual({ kind }: { kind: (typeof PILLARS)[number]["key"] }) {
  if (kind === "clinic") {
    return (
      <div className={styles.pillarVisual} aria-hidden="true">
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
        <p className={styles.termHint}>Post-treatment instructions</p>
        <div className={styles.radiusExamples}>
          <span className={styles.radiusSharp} />
          <span className={styles.radiusMedium} />
          <span className={styles.radiusSoft} />
        </div>
      </div>
    );
  }

  if (kind === "patients") {
    return (
      <div
        className={`${styles.pillarVisual} ${styles.patientPreview}`}
        aria-hidden="true"
      >
        <span className={styles.phoneOutline}>
          <span className={styles.typeLine} />
          <span className={`${styles.typeLine} ${styles.typeLineMid}`} />
          <span className={`${styles.microTimeline} ${styles.previewTimeline}`}>
            <span
              className={`${styles.timelineDot} ${styles.timelineDotCurrent}`}
            />
            <span className={styles.timelineRule} />
            <span className={styles.timelineDot} />
            <span className={styles.timelineRule} />
            <span
              className={`${styles.timelineDot} ${styles.timelineDotDone}`}
            />
          </span>
        </span>
        <div className={styles.patientHints}>
          <span className={styles.urlStrip} translate="no">
            riverside.[your-domain]/extraction
          </span>
          <span className={styles.contactChip}>Call the practice →</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pillarVisual} aria-hidden="true">
      <span className={styles.guideRow}>
        <span className={styles.guideCheck} />
        Tooth Extraction
      </span>
      <span className={styles.guideRow}>
        <span className={styles.guideCheck} />
        Dental Implant
      </span>
      <span className={`${styles.guideRow} ${styles.guideRowQuiet}`}>
        Root Canal
      </span>
    </div>
  );
}
