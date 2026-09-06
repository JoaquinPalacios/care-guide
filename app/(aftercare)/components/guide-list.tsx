import type { PublishedPracticeGuideSummary } from "@/lib/aftercare/types";

import styles from "../patient.module.css";

export function GuideList({
  guides,
}: {
  guides: PublishedPracticeGuideSummary[];
}) {
  if (guides.length === 0) {
    return (
      <p className={styles.empty}>
        No post-operative instructions are published by this practice yet.
        Contact the practice if you need recovery information after treatment.
      </p>
    );
  }

  return (
    <nav aria-label="Post-operative instructions">
      <ul className={styles.guideList}>
        {guides.map((guide) => (
          <li key={guide.id} className={styles.guideItem}>
            <a className={styles.guideLink} href={`/${guide.publicSlug}`}>
              <span className={styles.guideCardTitle}>{guide.title}</span>
              <span className={styles.guideCardHint}>
                View recovery instructions
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
