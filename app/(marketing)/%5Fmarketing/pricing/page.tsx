import Link from "next/link";

import {
  MarketingRevealCard,
  MarketingRevealGroup,
  MarketingRevealItem,
} from "@/app/(marketing)/components/marketing-experience";
import { MarketingShell } from "@/app/(marketing)/components/marketing-shell";
import { PRODUCT_NAME } from "@/lib/branding/product-name";
import {
  CONTACT_METADATA,
  marketingPageMetadata,
  PRICING_METADATA,
} from "@/lib/marketing/metadata";
import {
  COMING_AFTER_LAUNCH,
  LAUNCH_PLANS,
  PRICING_DISCLAIMER,
  PRICING_NOTES,
} from "@/lib/marketing/plans";
import { marketingPublicLinks } from "@/lib/marketing/public-links";
import { editorialRevealDelay } from "@/lib/marketing/reveal-timing";

import styles from "../../marketing.module.css";

export const metadata = marketingPageMetadata(PRICING_METADATA);

export default async function MarketingPricingPage() {
  const { staffHref } = await marketingPublicLinks();

  return (
    <MarketingShell currentPath="/pricing" staffHref={staffHref}>
      <main>
        <section
          className={`${styles.pageHero} ${styles.marketingBase}`}
          aria-labelledby="pricing-hero"
        >
          <div className={styles.inner}>
            <MarketingRevealGroup>
              <MarketingRevealItem delay={0}>
                <p className={styles.eyebrow}>Pricing</p>
              </MarketingRevealItem>
              <MarketingRevealItem delay={editorialRevealDelay(1)}>
                <h1 id="pricing-hero" className={styles.pageTitle}>
                  Simple plans for clinic-branded aftercare.
                </h1>
              </MarketingRevealItem>
              <MarketingRevealItem delay={editorialRevealDelay(2)}>
                <p className={`${styles.copy} ${styles.pageLede}`}>
                  {PRODUCT_NAME} is a branded, mobile-first aftercare page for
                  each practice — not live clinical monitoring, a patient CRM,
                  or a messaging platform. {PRICING_DISCLAIMER}
                </p>
              </MarketingRevealItem>
            </MarketingRevealGroup>
          </div>
        </section>

        <div className={styles.marketingSoft} data-mk-chapter="soft">
          <section className={styles.band} aria-labelledby="plans-heading">
            <div className={styles.inner}>
              <MarketingRevealGroup>
                <MarketingRevealItem delay={0}>
                  <p className={styles.eyebrow}>Plans</p>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(1)}>
                  <h2 id="plans-heading" className={styles.sectionTitle}>
                    Choose the shape that matches your practice
                  </h2>
                </MarketingRevealItem>
              </MarketingRevealGroup>
              <div className={styles.planGrid}>
                {LAUNCH_PLANS.map((plan, index) => (
                  <MarketingRevealCard
                    key={plan.id}
                    index={index}
                    className={styles.planRevealSlot}
                  >
                    <article
                      className={
                        plan.recommended
                          ? `${styles.planCard} ${styles.planCardRecommended}`
                          : styles.planCard
                      }
                      aria-labelledby={`plan-${plan.id}`}
                    >
                      {plan.recommended ? (
                        <p className={styles.planBadge}>Recommended</p>
                      ) : (
                        <p
                          className={styles.planBadgeSpacer}
                          aria-hidden="true"
                        >
                          &nbsp;
                        </p>
                      )}
                      <h3 id={`plan-${plan.id}`}>{plan.name}</h3>
                      <p className={styles.planPrice}>
                        <span className={styles.planAmount}>{plan.price}</span>
                        {plan.cadence ? (
                          <span className={styles.planCadence}>
                            {" "}
                            {plan.cadence}
                          </span>
                        ) : null}
                      </p>
                      <p className={styles.planPosition}>{plan.position}</p>
                      <ul className={styles.planFeatures}>
                        {plan.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                      <Link
                        className={`${styles.button} ${
                          plan.recommended ? styles.primary : styles.secondary
                        } ${styles.planCta}`}
                        href={plan.ctaHref}
                      >
                        {plan.ctaLabel}
                      </Link>
                    </article>
                  </MarketingRevealCard>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.band} aria-labelledby="onboarding-heading">
            <div className={styles.inner}>
              <MarketingRevealGroup>
                <MarketingRevealItem delay={0}>
                  <p className={styles.eyebrow}>Onboarding</p>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(1)}>
                  <h2 id="onboarding-heading" className={styles.sectionTitle}>
                    Start from a template, then make it yours
                  </h2>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(2)}>
                  <p className={styles.copy}>
                    Launch is assisted. We begin with a curated template, adapt
                    it to your practice, add local instructions, and publish it
                    under your clinic brand. Templates are structured and
                    configurable — not clinically certified by default.
                  </p>
                </MarketingRevealItem>
              </MarketingRevealGroup>
              <ol className={styles.storyList}>
                {[
                  "Start with a reviewed template such as Tooth Extraction, Wisdom Teeth Removal, Dental Implant, Periodontal Deep Cleaning, or Root Canal.",
                  "Adapt the guide to your practice with section overrides and local instructions.",
                  "Publish a durable, branded patient page patients can reopen on a phone.",
                ].map((step, index) => (
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
          <section className={styles.band} aria-labelledby="notes-heading">
            <div className={styles.inner}>
              <MarketingRevealGroup>
                <MarketingRevealItem delay={0}>
                  <p className={styles.eyebrow}>Commercial notes</p>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(1)}>
                  <h2 id="notes-heading" className={styles.sectionTitle}>
                    What these prices do and do not include
                  </h2>
                </MarketingRevealItem>
              </MarketingRevealGroup>
              <div className={styles.noteGrid}>
                {PRICING_NOTES.map((note, index) => (
                  <MarketingRevealCard
                    key={note.title}
                    index={index}
                    className={styles.noteCard}
                  >
                    <h3>{note.title}</h3>
                    <p>{note.body}</p>
                  </MarketingRevealCard>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.band} aria-labelledby="later-heading">
            <div className={styles.inner}>
              <MarketingRevealGroup>
                <MarketingRevealItem delay={0}>
                  <p className={styles.eyebrow}>Coming after launch</p>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(1)}>
                  <h2 id="later-heading" className={styles.sectionTitle}>
                    Planned, not in active plans
                  </h2>
                </MarketingRevealItem>
                <MarketingRevealItem delay={editorialRevealDelay(2)}>
                  <p className={styles.copy}>
                    Check-ins are a future premium or add-on capability. They
                    are not part of launch pricing, and no check-in price is
                    published yet.
                  </p>
                </MarketingRevealItem>
              </MarketingRevealGroup>
              <ul className={styles.laterList}>
                {COMING_AFTER_LAUNCH.map((item, index) => (
                  <MarketingRevealCard
                    key={item}
                    as="li"
                    index={index}
                    className={styles.laterItem}
                  >
                    {item}
                  </MarketingRevealCard>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <div className={styles.marketingClosing} data-mk-chapter="closing">
          <section
            className={styles.ctaBlock}
            aria-labelledby="pricing-closing"
          >
            <MarketingRevealGroup>
              <div className={`${styles.inner} ${styles.closingCta}`}>
                <div className={styles.closingCtaCopy}>
                  <MarketingRevealItem delay={0}>
                    <p className={styles.eyebrow}>Next step</p>
                    <h2 id="pricing-closing">Tell us about your practice.</h2>
                    <p className={styles.copy}>
                      {CONTACT_METADATA.description}
                    </p>
                  </MarketingRevealItem>
                </div>
                <MarketingRevealItem delay={editorialRevealDelay(1)}>
                  <div className={styles.closingCtaAction}>
                    <Link
                      className={`${styles.button} ${styles.primary}`}
                      href="/contact"
                    >
                      Request a demo
                    </Link>
                  </div>
                </MarketingRevealItem>
              </div>
            </MarketingRevealGroup>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
