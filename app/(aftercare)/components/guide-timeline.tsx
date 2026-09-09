import { sectionBodyParagraphs } from "@/lib/aftercare/section-body";
import type { TimelineStageStatus } from "@/lib/aftercare/demo-recovery-state";
import type { ComposedGuideSection } from "@/lib/aftercare/types";

import styles from "../patient.module.css";

const STATUS_LABEL: Record<TimelineStageStatus, string> = {
  earlier: "Earlier",
  current: "Current",
  upcoming: "Upcoming",
};

export function GuideTimeline({
  sections,
  stageStatusByKey,
  heading = "Recovery guide",
  headingId = "recovery-timeline-heading",
}: {
  sections: ComposedGuideSection[];
  stageStatusByKey?: Readonly<Record<string, TimelineStageStatus>>;
  heading?: string;
  headingId?: string;
}) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <section className={styles.timeline} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.sectionTitle}>
        {heading}
      </h2>
      <ol className={styles.timelineList}>
        {sections.map((section) => {
          const headingKey = `section-${section.key}`;
          const period = section.periodLabel;
          const status = stageStatusByKey?.[section.key];

          return (
            <li
              key={section.key}
              className={styles.timelineItem}
              data-status={status}
            >
              {period ? (
                <p className={styles.timelinePeriod}>{period}</p>
              ) : (
                <p className={styles.timelinePeriod} aria-hidden="true" />
              )}
              <div>
                <h3 id={headingKey} className={styles.sectionTitle}>
                  {status ? (
                    <span className={styles.vh}>{STATUS_LABEL[status]}. </span>
                  ) : null}
                  {section.title}
                </h3>
                {status ? (
                  <p className={styles.timelineStatus}>
                    {STATUS_LABEL[status]}
                  </p>
                ) : null}
                {sectionBodyParagraphs(section.body).map((paragraph, index) => (
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
