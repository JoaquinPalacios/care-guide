import {
  MarketingRevealGroup,
  MarketingRevealItem,
} from "@/app/(marketing)/components/marketing-experience";
import { MarketingPageHeroEdge } from "@/app/(marketing)/components/marketing-page-hero-edge";
import { editorialRevealDelay } from "@/lib/marketing/reveal-timing";

import styles from "../marketing.module.css";

export type MarketingPageHeroVariant = "pricing" | "contact";

export function MarketingPageHero({
  variant,
  eyebrow,
  titleId,
  title,
  intro,
}: {
  variant: MarketingPageHeroVariant;
  eyebrow: string;
  titleId: string;
  title: string;
  intro: string;
}) {
  const heroClass =
    variant === "pricing" ? styles.pageHeroPricing : styles.pageHeroContact;

  return (
    <section
      className={`${styles.pageHero} ${heroClass} ${styles.marketingBase}`}
      aria-labelledby={titleId}
      data-mk-page-hero={variant}
    >
      <div className={`${styles.inner} ${styles.pageHeroInner}`}>
        <MarketingRevealGroup>
          <MarketingRevealItem delay={0}>
            <p className={styles.eyebrow}>{eyebrow}</p>
          </MarketingRevealItem>
          <MarketingRevealItem delay={editorialRevealDelay(1)}>
            <h1 id={titleId} className={styles.pageTitle}>
              {title}
            </h1>
          </MarketingRevealItem>
          <MarketingRevealItem delay={editorialRevealDelay(2)}>
            <p className={`${styles.copy} ${styles.pageLede}`}>{intro}</p>
          </MarketingRevealItem>
        </MarketingRevealGroup>
      </div>
      <MarketingPageHeroEdge />
    </section>
  );
}
