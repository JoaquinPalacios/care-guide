import { guideSectionTone } from "@/lib/aftercare/guide-section-tone";
import type { ComposedGuideSection } from "@/lib/aftercare/types";

import styles from "../patient.module.css";

function sectionClassName(tone: ReturnType<typeof guideSectionTone>): string {
  if (tone === "warning") {
    return `${styles.section} ${styles.warning}`;
  }
  if (tone === "emergency") {
    return `${styles.section} ${styles.emergency}`;
  }
  return styles.section;
}

function visuallyHiddenPrefix(
  tone: ReturnType<typeof guideSectionTone>
): string | null {
  if (tone === "warning") {
    return "Important. ";
  }
  if (tone === "emergency") {
    return "Urgent. ";
  }
  return null;
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function GuideSection({ section }: { section: ComposedGuideSection }) {
  const tone = guideSectionTone(section.kind);
  const headingId = `section-${section.key}`;
  const prefix = visuallyHiddenPrefix(tone);

  return (
    <section className={sectionClassName(tone)} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.sectionTitle}>
        {prefix ? <span className={styles.vh}>{prefix}</span> : null}
        {section.title}
      </h2>
      {bodyParagraphs(section.body).map((paragraph, index) => (
        <p key={`${section.key}-${index}`} className={styles.body}>
          {paragraph}
        </p>
      ))}
    </section>
  );
}
