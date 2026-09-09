import { headers } from "next/headers";
import Link from "next/link";

import {
  MarketingExperience,
  MarketingRevealCard,
  MarketingRevealGroup,
  MarketingRevealHero,
  MarketingRevealItem,
  MarketingRevealPreview,
} from "@/app/(marketing)/components/marketing-experience";
import { MarketingPatientPreview } from "@/app/(marketing)/components/marketing-patient-preview";
import { MarketingPillars } from "@/app/(marketing)/components/marketing-pillars";
import { MarketingProcess } from "@/app/(marketing)/components/marketing-process";
import { MarketingProductAssembly } from "@/app/(marketing)/components/marketing-product-assembly";
import { MarketingProductPreview } from "@/app/(marketing)/components/marketing-product-preview";
import { MarketingThemeControl } from "@/app/(marketing)/components/marketing-theme-control";
import { MarketingWave } from "@/app/(marketing)/components/marketing-wave";
import { DEMO_AFTERCARE_TENANT_SLUG } from "@/lib/aftercare/demo-tenant";
import { PRODUCT_NAME } from "@/lib/branding/product-name";
import { editorialRevealDelay } from "@/lib/marketing/reveal-timing";
import { labeledPublicUrl } from "@/lib/tenancy/public-url";
import { getRootDomain } from "@/lib/tenancy/root-domain";

import styles from "../marketing.module.css";

const MarketingReveal = {
  Card: MarketingRevealCard,
  Group: MarketingRevealGroup,
  Hero: MarketingRevealHero,
  Item: MarketingRevealItem,
  Preview: MarketingRevealPreview,
};

const FRICTION = [
  {
    index: "01",
    copy: "Verbal advice is easy to forget once the appointment ends.",
  },
  {
    index: "02",
    copy: "Paper is easy to lose, and PDFs are awkward to reopen on a phone.",
  },
  {
    index: "03",
    copy: "Generic handouts weaken the clinic's own identity.",
  },
] as const;

const BRAND_CARDS = [
  {
    key: "riverside",
    className: styles.brandTeal,
    title: "Riverside Dental Demo",
    copy: "Calm clinical teal for a modern general dental practice.",
  },
  {
    key: "specialist",
    className: styles.brandNavy,
    title: "Specialist oral surgery",
    copy: "Ink and navy for a quieter specialist tone.",
  },
  {
    key: "family",
    className: styles.brandWarm,
    title: "Family dental",
    copy: "A warmer palette for a softer, more approachable welcome.",
  },
] as const;

async function marketingLinks(): Promise<{
  demoHref: string;
  staffHref: string;
}> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const rootDomain = getRootDomain();

  return {
    demoHref:
      labeledPublicUrl({
        requestHost: host,
        rootDomain,
        label: DEMO_AFTERCARE_TENANT_SLUG,
        protocol,
      }) ?? `http://${DEMO_AFTERCARE_TENANT_SLUG}.localhost:3000/`,
    staffHref:
      labeledPublicUrl({
        requestHost: host,
        rootDomain,
        label: "app",
        protocol,
        pathname: "/login",
      }) ?? "http://app.localhost:3000/login",
  };
}

export default async function MarketingHomePage() {
  const { demoHref, staffHref } = await marketingLinks();

  return (
    <MarketingExperience className={styles.page}>
      <header className={`${styles.top} ${styles.marketingBase}`}>
        <div className={styles.topInner}>
          <Link className={styles.wordmark} href="/">
            <svg
              className={styles.mark}
              viewBox="0 0 32 32"
              aria-hidden="true"
              focusable="false"
            >
              <rect
                x="5"
                y="4"
                width="16"
                height="21"
                rx="3.5"
                fill="currentColor"
                opacity="0.38"
              />
              <rect
                x="11"
                y="8"
                width="16"
                height="21"
                rx="3.5"
                fill="currentColor"
              />
            </svg>
            {PRODUCT_NAME}
          </Link>
          <nav className={styles.nav} aria-label="Marketing">
            <Link
              className={`${styles.navAnchor} ${styles.textLink}`}
              href="#how-it-works"
            >
              How it works
            </Link>
            <Link
              className={`${styles.navAnchor} ${styles.textLink}`}
              href="#preview"
            >
              Clinic preview
            </Link>
            <a
              className={`${styles.navStaff} ${styles.textLink}`}
              href={staffHref}
            >
              Staff sign in
            </a>
            <MarketingThemeControl />
          </nav>
        </div>
      </header>

      <main>
        <section
          className={`${styles.hero} ${styles.marketingBase}`}
          aria-labelledby="marketing-hero"
          data-mk-chapter="hero"
        >
          <div className={styles.heroFrame}>
            <MarketingReveal.Hero>
              <div className={`${styles.inner} ${styles.heroLayout}`}>
                <div className={styles.heroTitleBlock}>
                  <MarketingReveal.Item>
                    <p className={`${styles.eyebrow} ${styles.heroEyebrow}`}>
                      Aftercare platform
                    </p>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item>
                    <h1 id="marketing-hero" className={styles.heroTitle}>
                      Aftercare that still feels like your clinic.
                    </h1>
                  </MarketingReveal.Item>
                </div>
                <div className={styles.heroLower}>
                  <div className={styles.heroSupport}>
                    <MarketingReveal.Item>
                      <p className={`${styles.lede} ${styles.heroBody}`}>
                        Turn approved post-treatment instructions into branded,
                        mobile-first pages patients can reopen whenever they
                        need them. No app. No login. No PDF to hunt down.
                      </p>
                    </MarketingReveal.Item>
                    <MarketingReveal.Item>
                      <div
                        className={`${styles.actions} ${styles.heroActions}`}
                      >
                        <a
                          className={`${styles.button} ${styles.primary}`}
                          href={demoHref}
                        >
                          View the clinic demo
                        </a>
                        <Link
                          className={`${styles.button} ${styles.secondary}`}
                          href="#how-it-works"
                        >
                          See how it works
                        </Link>
                      </div>
                    </MarketingReveal.Item>
                  </div>
                  <MarketingReveal.Preview>
                    <MarketingProductPreview />
                  </MarketingReveal.Preview>
                </div>
              </div>
            </MarketingReveal.Hero>
          </div>
          <MarketingWave />
        </section>

        <div className={styles.marketingSoft} data-mk-chapter="soft">
          <section className={styles.band} aria-labelledby="problem-heading">
            <div className={styles.inner}>
              <MarketingReveal.Group>
                <MarketingReveal.Item delay={0}>
                  <p className={styles.eyebrow}>The problem</p>
                </MarketingReveal.Item>
                <div className={styles.problemGrid}>
                  <MarketingReveal.Item delay={editorialRevealDelay(1)}>
                    <h2 id="problem-heading" className={styles.problemTitle}>
                      Patients leave with instructions. They don&apos;t always
                      leave with clarity.
                    </h2>
                  </MarketingReveal.Item>
                  <ol className={styles.frictionList}>
                    {FRICTION.map((item, index) => (
                      <MarketingReveal.Card
                        key={item.index}
                        as="li"
                        index={index}
                        className={styles.frictionItem}
                      >
                        <span className={styles.frictionIndex}>
                          {item.index}
                        </span>
                        <p>{item.copy}</p>
                      </MarketingReveal.Card>
                    ))}
                  </ol>
                </div>
              </MarketingReveal.Group>
            </div>
          </section>

          <section className={styles.band} aria-labelledby="product-heading">
            <MarketingReveal.Group>
              <div className={`${styles.inner} ${styles.productGrid}`}>
                <div className={styles.productCopy} data-mk-product-copy="">
                  <MarketingReveal.Item delay={0}>
                    <p className={styles.eyebrow}>The product</p>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item delay={editorialRevealDelay(1)}>
                    <h2 id="product-heading">
                      A branded patient aftercare page that stays available.
                    </h2>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item delay={editorialRevealDelay(2)}>
                    <p className={styles.copy}>
                      {PRODUCT_NAME} gives each practice a durable, clinic-first
                      aftercare home. Patients reopen the same instructions in
                      the practice&apos;s look — without creating an account.
                    </p>
                  </MarketingReveal.Item>
                </div>
                <div className={styles.productVisual} data-mk-product-visual="">
                  <MarketingProductAssembly />
                </div>
              </div>
            </MarketingReveal.Group>
          </section>

          <section
            id="how-it-works"
            className={styles.band}
            aria-labelledby="how-heading"
          >
            <div className={styles.inner}>
              <MarketingReveal.Group>
                <MarketingReveal.Item delay={0}>
                  <p className={styles.eyebrow}>How it works</p>
                </MarketingReveal.Item>
                <MarketingReveal.Item delay={editorialRevealDelay(1)}>
                  <h2 id="how-heading" className={styles.sectionTitle}>
                    From approved guidance to a page patients keep
                  </h2>
                </MarketingReveal.Item>
              </MarketingReveal.Group>
              <MarketingProcess />
            </div>
          </section>

          <section className={styles.band} aria-labelledby="why-heading">
            <div className={styles.inner}>
              <MarketingReveal.Group>
                <MarketingReveal.Item delay={0}>
                  <p className={styles.eyebrow}>Why clinics use it</p>
                </MarketingReveal.Item>
                <MarketingReveal.Item delay={editorialRevealDelay(1)}>
                  <h2 id="why-heading" className={styles.sectionTitle}>
                    Clinic-first aftercare, built for rereading
                  </h2>
                </MarketingReveal.Item>
              </MarketingReveal.Group>
              <MarketingPillars />
            </div>
          </section>
        </div>

        <div className={styles.marketingShowcase} data-mk-chapter="showcase">
          <section className={styles.band} aria-labelledby="brand-heading">
            <div className={styles.inner}>
              <MarketingReveal.Group>
                <MarketingReveal.Item delay={0}>
                  <p className={styles.eyebrow}>Brand flexibility</p>
                </MarketingReveal.Item>
                <MarketingReveal.Item delay={editorialRevealDelay(1)}>
                  <h2 id="brand-heading" className={styles.sectionTitle}>
                    One product, many practice identities
                  </h2>
                </MarketingReveal.Item>
                <MarketingReveal.Item delay={editorialRevealDelay(2)}>
                  <p className={styles.copy}>
                    Choose a visual tone that feels at home with your practice
                    while the patient experience stays consistent and easy to
                    read.
                  </p>
                </MarketingReveal.Item>
              </MarketingReveal.Group>
              <div className={styles.brandGrid}>
                {BRAND_CARDS.map((card, index) => (
                  <MarketingReveal.Card
                    key={card.key}
                    index={index}
                    className={styles.brandRevealSlot}
                  >
                    <article
                      className={`${styles.brandCard} ${card.className}`}
                    >
                      <h3>{card.title}</h3>
                      <p>{card.copy}</p>
                    </article>
                  </MarketingReveal.Card>
                ))}
              </div>
            </div>
          </section>

          <section
            id="preview"
            className={styles.band}
            aria-labelledby="preview-heading"
          >
            <MarketingReveal.Group>
              <div className={`${styles.inner} ${styles.previewGrid}`}>
                <div className={styles.previewCopy}>
                  <MarketingReveal.Item delay={0}>
                    <p className={styles.eyebrow}>Clinic preview</p>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item delay={editorialRevealDelay(1)}>
                    <h2 id="preview-heading">
                      See what patients actually receive
                    </h2>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item delay={editorialRevealDelay(2)}>
                    <p className={styles.copy}>
                      The Riverside Dental Demo shows the patient experience:
                      clinic branding, post-treatment instructions, and a
                      published Tooth Extraction guide.
                    </p>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item delay={editorialRevealDelay(3)}>
                    <div className={styles.actions}>
                      <a
                        className={`${styles.button} ${styles.primary}`}
                        href={demoHref}
                      >
                        Open Riverside Dental Demo
                      </a>
                    </div>
                  </MarketingReveal.Item>
                </div>
                <MarketingReveal.Item delay={editorialRevealDelay(4)} preview>
                  <MarketingPatientPreview />
                </MarketingReveal.Item>
              </div>
            </MarketingReveal.Group>
          </section>
        </div>

        <div className={styles.marketingClosing} data-mk-chapter="closing">
          <section
            id="see-it"
            className={styles.ctaBlock}
            aria-labelledby="closing-heading"
          >
            <MarketingReveal.Group>
              <div className={`${styles.inner} ${styles.closingCta}`}>
                <div className={styles.closingCtaCopy}>
                  <MarketingReveal.Item delay={0}>
                    <p className={styles.eyebrow}>See it in practice</p>
                    <h2 id="closing-heading">
                      See the patient experience for yourself.
                    </h2>
                    <p className={styles.copy}>
                      Open the Riverside Dental Demo and see how clinic-branded
                      aftercare works on a real patient page.
                    </p>
                  </MarketingReveal.Item>
                </div>
                <MarketingReveal.Item delay={editorialRevealDelay(1)}>
                  <div className={styles.closingCtaAction}>
                    <a
                      className={`${styles.button} ${styles.primary}`}
                      href={demoHref}
                    >
                      View the clinic demo
                    </a>
                  </div>
                </MarketingReveal.Item>
              </div>
            </MarketingReveal.Group>
          </section>
        </div>
      </main>
      <footer className={`${styles.footer} ${styles.marketingClosing}`}>
        <div className={styles.inner}>
          <div className={styles.footerSeparator} aria-hidden="true" />
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <p className={styles.footerName}>{PRODUCT_NAME}</p>
              <p className={styles.footerTag}>
                Clinic-branded aftercare patients can revisit.
              </p>
            </div>
            <nav className={styles.footerNav} aria-label="Footer">
              <Link className={styles.textLink} href="#how-it-works">
                How it works
              </Link>
              <Link className={styles.textLink} href="#preview">
                Clinic preview
              </Link>
              <a className={styles.textLink} href={staffHref}>
                Staff sign in
              </a>
            </nav>
          </div>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} {PRODUCT_NAME}
          </p>
        </div>
      </footer>
    </MarketingExperience>
  );
}
