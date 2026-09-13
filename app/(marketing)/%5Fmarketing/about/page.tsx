import { JsonLd } from "@/app/(marketing)/components/json-ld";
import {
  MarketingRevealGroup,
  MarketingRevealItem,
} from "@/app/(marketing)/components/marketing-experience";
import { MarketingPageHero } from "@/app/(marketing)/components/marketing-page-hero";
import { MarketingPrimaryLink } from "@/app/(marketing)/components/marketing-primary-link";
import { MarketingShell } from "@/app/(marketing)/components/marketing-shell";
import { PRODUCT_NAME } from "@/lib/branding/product-name";
import { marketingPublicLinks } from "@/lib/marketing/public-links";
import { editorialRevealDelay } from "@/lib/marketing/reveal-timing";
import {
  generateMarketingMetadata,
  loadMarketingJsonLd,
} from "@/lib/seo/marketing-page";

import styles from "../../marketing.module.css";

export const generateMetadata = () => generateMarketingMetadata("/about");

export default async function MarketingAboutPage() {
  const [{ staffHref }, jsonLd] = await Promise.all([
    marketingPublicLinks(),
    loadMarketingJsonLd("/about"),
  ]);

  return (
    <MarketingShell currentPath="/about" staffHref={staffHref}>
      <JsonLd data={jsonLd} />
      <main>
        <MarketingPageHero
          variant="about"
          eyebrow="About"
          titleId="about-hero"
          title={`${PRODUCT_NAME} is branded aftercare for practices.`}
          intro={`${PRODUCT_NAME} is a structured clinical aftercare publishing platform. Practices keep their own identity on the pages patients reopen after treatment.`}
        />

        <div className={styles.marketingSoft} data-mk-chapter="soft">
          <section className={styles.band} aria-labelledby="about-what">
            <div className={styles.inner}>
              <MarketingRevealGroup>
                <MarketingRevealItem delay={0}>
                  <p className={styles.eyebrow}>What it is</p>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(1)}>
                  <h2 id="about-what" className={styles.sectionTitle}>
                    Clinic-branded instructions, on the web
                  </h2>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(2)}>
                  <p className={styles.copy}>
                    {PRODUCT_NAME} helps healthcare practices publish
                    mobile-first aftercare pages that still feel like the
                    clinic. Patients reopen procedure-specific guidance without
                    an app, an account, or a downloaded PDF.
                  </p>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(3)}>
                  <p className={styles.copy}>
                    The first vertical is dental. The public pages are web-first
                    documents, not live clinical monitoring, a patient CRM, or a
                    messaging platform.
                  </p>
                </MarketingRevealItem>
              </MarketingRevealGroup>
            </div>
          </section>

          <section className={styles.band} aria-labelledby="about-not">
            <div className={styles.inner}>
              <MarketingRevealGroup>
                <MarketingRevealItem delay={0}>
                  <p className={styles.eyebrow}>What it is not</p>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(1)}>
                  <h2 id="about-not" className={styles.sectionTitle}>
                    No invented clinical authority
                  </h2>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(2)}>
                  <p className={styles.copy}>
                    {PRODUCT_NAME} does not replace the treating clinician.
                    Clinic-owned aftercare copy remains the practice&apos;s
                    responsibility. This page does not claim certification,
                    regulatory approval, customer counts, or health outcomes.
                  </p>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(3)}>
                  <p className={styles.copy}>
                    Privacy and Terms will be published when approved legal copy
                    is ready. Until then, use Contact for clinic enquiries.
                  </p>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(4)}>
                  <p className={styles.copy}>
                    <MarketingPrimaryLink href="/contact">
                      Talk to us about a demo
                    </MarketingPrimaryLink>
                  </p>
                </MarketingRevealItem>
              </MarketingRevealGroup>
            </div>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
