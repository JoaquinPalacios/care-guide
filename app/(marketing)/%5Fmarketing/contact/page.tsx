import Link from "next/link";

import {
  MarketingRevealCard,
  MarketingRevealGroup,
  MarketingRevealItem,
} from "@/app/(marketing)/components/marketing-experience";
import { MarketingShell } from "@/app/(marketing)/components/marketing-shell";
import { PRODUCT_NAME } from "@/lib/branding/product-name";
import {
  getMarketingContactEmail,
  marketingEnquiryMailto,
} from "@/lib/marketing/contact-email";
import {
  CONTACT_METADATA,
  marketingPageMetadata,
} from "@/lib/marketing/metadata";
import { marketingPublicLinks } from "@/lib/marketing/public-links";
import { editorialRevealDelay } from "@/lib/marketing/reveal-timing";

import styles from "../../marketing.module.css";

export const metadata = marketingPageMetadata(CONTACT_METADATA);

const AUDIENCE = [
  "Dental practices that want aftercare to look like the clinic, not a generic pamphlet site.",
  "Owners and practice managers who need durable, phone-first instructions patients can reopen.",
  "Groups exploring a consistent aftercare presence across more than one location.",
] as const;

const NEXT_STEPS = [
  "Tell us about your practice — locations, procedures, and how you currently hand over aftercare.",
  "We walk through the Riverside Dental Demo and the pages that would belong to your clinic.",
  "If it is a fit, we set up branding, contact details, and the first guides with you.",
] as const;

const SETUP_ITEMS = [
  "Clinic branding: name, colours, logo, and presentation controls.",
  "Contact and emergency information patients should see.",
  "Relevant dental guide templates for the care you provide.",
  "Local instructions and section overrides where they matter.",
  "Preview, then publish under your clinic brand.",
] as const;

const NEED_ITEMS = [
  "Practice name, logo, and a short sense of visual tone.",
  "The phone number and urgent-contact wording patients should use.",
  "Which procedures you want live first — often extraction, implants, or root canal.",
] as const;

export default async function MarketingContactPage() {
  const { demoHref, staffHref } = await marketingPublicLinks();
  const email = getMarketingContactEmail();
  const mailto = email ? marketingEnquiryMailto(email) : null;

  return (
    <MarketingShell currentPath="/contact" staffHref={staffHref}>
      <main>
        <section
          className={`${styles.pageHero} ${styles.marketingBase}`}
          aria-labelledby="contact-hero"
        >
          <div className={styles.inner}>
            <MarketingRevealGroup>
              <MarketingRevealItem delay={0}>
                <p className={styles.eyebrow}>Get started</p>
              </MarketingRevealItem>
              <MarketingRevealItem delay={editorialRevealDelay(1)}>
                <h1 id="contact-hero" className={styles.pageTitle}>
                  Bring your aftercare online without losing your clinic&apos;s
                  identity.
                </h1>
              </MarketingRevealItem>
              <MarketingRevealItem delay={editorialRevealDelay(2)}>
                <p className={`${styles.copy} ${styles.pageLede}`}>
                  This is the {PRODUCT_NAME} platform contact page for
                  interested clinics — not Riverside Dental. Tell us about your
                  practice, request a demo, or ask about early access.
                </p>
              </MarketingRevealItem>
              <MarketingRevealItem delay={editorialRevealDelay(3)}>
                <div className={styles.actions}>
                  {mailto ? (
                    <a
                      className={`${styles.button} ${styles.primary}`}
                      href={mailto}
                    >
                      Email us about your clinic
                    </a>
                  ) : null}
                  <a
                    className={`${styles.button} ${styles.secondary}`}
                    href={demoHref}
                  >
                    View the clinic demo
                  </a>
                  <Link
                    className={`${styles.button} ${styles.secondary}`}
                    href="/pricing"
                  >
                    See pricing
                  </Link>
                </div>
              </MarketingRevealItem>
            </MarketingRevealGroup>
          </div>
        </section>

        <div className={styles.marketingSoft} data-mk-chapter="soft">
          <section className={styles.band} aria-labelledby="audience-heading">
            <div className={`${styles.inner} ${styles.contactSplit}`}>
              <MarketingRevealGroup>
                <MarketingRevealItem delay={0}>
                  <p className={styles.eyebrow}>Who it&apos;s for</p>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(1)}>
                  <h2 id="audience-heading" className={styles.sectionTitle}>
                    Clinics that want aftercare to stay theirs
                  </h2>
                </MarketingRevealItem>
              </MarketingRevealGroup>
              <ul className={styles.contactPoints}>
                {AUDIENCE.map((item, index) => (
                  <MarketingRevealCard
                    key={item}
                    as="li"
                    index={index}
                    className={styles.contactPoint}
                  >
                    {item}
                  </MarketingRevealCard>
                ))}
              </ul>
            </div>
          </section>

          <section className={styles.band} aria-labelledby="next-heading">
            <div className={styles.inner}>
              <MarketingRevealGroup>
                <MarketingRevealItem delay={0}>
                  <p className={styles.eyebrow}>What happens next</p>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(1)}>
                  <h2 id="next-heading" className={styles.sectionTitle}>
                    A short, assisted conversation
                  </h2>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(2)}>
                  <p className={styles.copy}>
                    Onboarding is intended to stay simple. We do not promise
                    custom implementation work by default.
                  </p>
                </MarketingRevealItem>
              </MarketingRevealGroup>
              <ol className={styles.storyList}>
                {NEXT_STEPS.map((step, index) => (
                  <MarketingRevealCard
                    key={step}
                    as="li"
                    index={index}
                    className={styles.storyItem}
                  >
                    <span className={styles.frictionIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p>{step}</p>
                  </MarketingRevealCard>
                ))}
              </ol>
            </div>
          </section>
        </div>

        <div className={styles.marketingShowcase} data-mk-chapter="showcase">
          <section className={styles.band} aria-labelledby="setup-heading">
            <div className={`${styles.inner} ${styles.contactPair}`}>
              <article className={styles.contactPanel}>
                <p className={styles.eyebrow}>What we&apos;ll set up</p>
                <h2 id="setup-heading">The first clinic presence</h2>
                <ul>
                  {SETUP_ITEMS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className={styles.contactPanel}>
                <p className={styles.eyebrow}>What you&apos;ll need</p>
                <h2 id="need-heading">A few practice details</h2>
                <ul>
                  {NEED_ITEMS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        </div>

        <div className={styles.marketingClosing} data-mk-chapter="closing">
          <section className={styles.ctaBlock} aria-labelledby="email-heading">
            <div className={`${styles.inner} ${styles.closingCta}`}>
              <div className={styles.closingCtaCopy}>
                <p className={styles.eyebrow}>Email us</p>
                <h2 id="email-heading">
                  {mailto
                    ? "Write from your practice address."
                    : "A clinic enquiry address is configured per environment."}
                </h2>
                <p className={styles.copy}>
                  {mailto
                    ? "Opens your email client with the subject “Aftercare Guide — clinic enquiry”. There is no form on this page, and nothing is submitted to a CRM."
                    : "This site does not currently publish a clinic enquiry address. Nothing is submitted from this page."}
                </p>
              </div>
              {mailto ? (
                <div className={styles.closingCtaAction}>
                  <a
                    className={`${styles.button} ${styles.primary}`}
                    href={mailto}
                  >
                    Email {email}
                  </a>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
