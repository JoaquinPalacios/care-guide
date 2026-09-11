import { RecoveryTimelineList } from "@/app/(aftercare)/components/recovery-timeline-list";
import { editorStagesToPreviewSections } from "@/lib/clinic-portal/editor-preview-sections";

import styles from "./editor-live-preview.module.css";

export function EditorLivePreview({
  stages,
}: {
  stages: Array<{
    key: string;
    title: string;
    body: string;
    periodLabel: string;
    startDay: string;
    endDay: string;
  }>;
}) {
  const sections = editorStagesToPreviewSections(stages);

  if (sections.length === 0) {
    return (
      <div
        className={`${styles.preview} ${styles.emptyState}`}
        data-live-preview=""
      >
        <h2 id="editor-live-timeline-heading" className={styles.heading}>
          Patient timeline preview
        </h2>
        <p className={styles.empty}>
          Add a recovery stage to see the patient timeline here.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.preview} data-live-preview="">
      <p className="sr-only">
        Live preview of the patient recovery timeline from the current unsaved
        draft. Stage order and titles update as you edit. This is not the public
        patient page.
      </p>
      <RecoveryTimelineList
        sections={sections}
        heading="Live patient timeline"
        headingId="editor-live-timeline-heading"
        compact
        labelledAsPreview
        classes={{
          timeline: "",
          sectionTitle: styles.title,
          timelineList: styles.list,
          timelineItem: styles.item,
          timelinePeriod: styles.period,
          timelineRail: styles.rail,
          timelineContent: styles.content,
        }}
      />
    </div>
  );
}
