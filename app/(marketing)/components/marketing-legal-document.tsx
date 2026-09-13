import { MarketingPageHero } from "@/app/(marketing)/components/marketing-page-hero";
import type { LegalDocument } from "@/lib/legal/document";

import styles from "../marketing.module.css";

export function MarketingLegalDocument({
  document,
}: {
  document: LegalDocument;
}) {
  return (
    <>
      <MarketingPageHero
        variant="legal"
        eyebrow={document.eyebrow}
        titleId={`${document.slug.slice(1)}-hero`}
        title={document.title}
        intro={document.intro}
      />
      <div className={styles.marketingSoft} data-mk-chapter="soft">
        <article
          className={`${styles.band} ${styles.legalArticle}`}
          aria-labelledby={`${document.slug.slice(1)}-hero`}
        >
          <div className={styles.inner}>
            <p className={styles.legalBanner} role="note">
              {document.draftBanner}
            </p>
            <p className={styles.legalUpdated}>
              Last updated{" "}
              <time dateTime={document.lastUpdatedIso}>
                {document.lastUpdatedLabel}
              </time>
              .
            </p>
            {document.sections.map((section) => (
              <section
                key={section.id}
                className={styles.legalSection}
                aria-labelledby={`legal-${section.id}`}
              >
                <h2 id={`legal-${section.id}`} className={styles.legalHeading}>
                  {section.title}
                </h2>
                {section.blocks.map((block, index) => {
                  if (block.type === "ul") {
                    return (
                      <ul
                        key={`${section.id}-list-${index}`}
                        className={styles.legalList}
                      >
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  if (block.type === "placeholder") {
                    return (
                      <p
                        key={`${section.id}-placeholder-${index}`}
                        className={styles.legalPlaceholder}
                      >
                        {block.text}
                      </p>
                    );
                  }

                  return (
                    <p
                      key={`${section.id}-p-${index}`}
                      className={styles.legalCopy}
                    >
                      {block.text}
                    </p>
                  );
                })}
              </section>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}
