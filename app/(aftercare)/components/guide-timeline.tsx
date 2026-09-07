import type { ComposedGuideSection } from "@/lib/aftercare/types";

import styles from "../patient.module.css";

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function GuideTimeline({
  sections,
}: {
  sections: ComposedGuideSection[];
}) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <section
      className={styles.timeline}
      aria-labelledby="recovery-timeline-heading"
    >
      <h2 id="recovery-timeline-heading" className={styles.sectionTitle}>
        Recovery guide
      </h2>
      <ol className={styles.timelineList}>
        {sections.map((section) => {
          const headingId = `section-${section.key}`;
          const period = section.periodLabel;

          return (
            <li key={section.key} className={styles.timelineItem}>
              {period ? (
                <p className={styles.timelinePeriod}>{period}</p>
              ) : (
                <p className={styles.timelinePeriod} aria-hidden="true" />
              )}
              <div>
                <h3 id={headingId} className={styles.sectionTitle}>
                  {section.title}
                </h3>
                {bodyParagraphs(section.body).map((paragraph, index) => (
                  <p key={`${section.key}-${index}`} className={styles.body}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
