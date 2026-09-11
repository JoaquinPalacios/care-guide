import { relativeTimelinePeriodLabel } from "@/lib/aftercare/relative-day-label";
import {
  firstSectionParagraph,
  sectionBodyParagraphs,
} from "@/lib/aftercare/section-body";
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
  compact = false,
}: {
  sections: ComposedGuideSection[];
  stageStatusByKey?: Readonly<Record<string, TimelineStageStatus>>;
  heading?: string;
  headingId?: string;
  compact?: boolean;
}) {
  if (sections.length === 0) {
    return null;
  }

  const lastIndex = sections.length - 1;

  return (
    <section className={styles.timeline} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.sectionTitle}>
        {heading}
      </h2>
      <ol className={styles.timelineList}>
        {sections.map((section, index) => {
          const headingKey = `section-${section.key}`;
          const period = relativeTimelinePeriodLabel(section);
          const status = stageStatusByKey?.[section.key];
          const isLast = index === lastIndex;
          const excerpt = compact ? firstSectionParagraph(section.body) : null;

          return (
            <li
              key={section.key}
              className={styles.timelineItem}
              data-status={status}
              data-timeline-stage=""
            >
              {period ? (
                <p className={styles.timelinePeriod}>{period}</p>
              ) : (
                <p className={styles.timelinePeriod} aria-hidden="true" />
              )}
              <span className={styles.timelineRail} aria-hidden="true" />
              <div className={styles.timelineContent}>
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
                {compact ? (
                  excerpt ? (
                    <p className={styles.body}>{excerpt}</p>
                  ) : null
                ) : (
                  sectionBodyParagraphs(section.body).map(
                    (paragraph, bodyIndex) => (
                      <p
                        key={`${section.key}-${bodyIndex}`}
                        className={styles.body}
                      >
                        {paragraph}
                      </p>
                    )
                  )
                )}
                {isLast ? null : (
                  <div
                    className={styles.timelineSeparator}
                    aria-hidden="true"
                    data-timeline-separator=""
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
