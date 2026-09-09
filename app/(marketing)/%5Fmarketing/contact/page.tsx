import {
  MarketingRevealGroup,
  MarketingRevealItem,
} from "@/app/(marketing)/components/marketing-experience";
import { ContactForm } from "@/app/(marketing)/components/contact-form";
import { MarketingPageHero } from "@/app/(marketing)/components/marketing-page-hero";
import { MarketingShell } from "@/app/(marketing)/components/marketing-shell";
import { PRODUCT_NAME } from "@/lib/branding/product-name";
import {
  CONTACT_METADATA,
  marketingPageMetadata,
} from "@/lib/marketing/metadata";
import { marketingPublicLinks } from "@/lib/marketing/public-links";

import styles from "../../marketing.module.css";

export const metadata = marketingPageMetadata(CONTACT_METADATA);

export default async function MarketingContactPage() {
  const { demoHref, staffHref } = await marketingPublicLinks();

  return (
    <MarketingShell currentPath="/contact" staffHref={staffHref}>
      <main>
        <MarketingPageHero
          variant="contact"
          eyebrow="Get started"
          titleId="contact-hero"
          title="Bring your aftercare online without losing your clinic's identity."
          intro={`Tell us about your practice and we will walk through branded aftercare pages with you. This is the ${PRODUCT_NAME} platform — not a clinic patient site.`}
        />

        <div className={styles.marketingSoft} data-mk-chapter="soft">
          <section
            className={styles.band}
            aria-labelledby="contact-form-heading"
          >
            <div className={styles.inner}>
              <MarketingRevealGroup>
                <MarketingRevealItem delay={0}>
                  <ContactForm demoHref={demoHref} />
                </MarketingRevealItem>
              </MarketingRevealGroup>
            </div>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
