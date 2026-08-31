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
        No aftercare guides are available from this practice yet.
      </p>
    );
  }

  return (
    <nav aria-label="Aftercare guides">
      <ul className={styles.guideList}>
        {guides.map((guide) => (
          <li key={guide.id} className={styles.guideItem}>
            <a className={styles.guideLink} href={`/${guide.publicSlug}`}>
              {guide.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
