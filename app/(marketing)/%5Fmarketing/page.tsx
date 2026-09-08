import { headers } from "next/headers";
import Link from "next/link";

import {
  MarketingExperience,
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
import { labeledPublicUrl } from "@/lib/tenancy/public-url";
import { getRootDomain } from "@/lib/tenancy/root-domain";

import styles from "../marketing.module.css";

const MarketingReveal = {
  Group: MarketingRevealGroup,
  Hero: MarketingRevealHero,
  Item: MarketingRevealItem,
  Preview: MarketingRevealPreview,
};

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
            <Link
              className={`${styles.navAnchor} ${styles.textLink}`}
              href="#early-access"
            >
              Early access
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
            <MarketingReveal.Group>
              <div className={styles.inner}>
                <MarketingReveal.Item>
                  <p className={styles.eyebrow}>The problem</p>
                </MarketingReveal.Item>
                <div className={styles.problemGrid}>
                  <MarketingReveal.Item>
                    <h2 id="problem-heading" className={styles.problemTitle}>
                      Patients leave with instructions. They don&apos;t always
                      leave with clarity.
                    </h2>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item>
                    <ol className={styles.frictionList}>
                      <li className={styles.frictionItem}>
                        <span className={styles.frictionIndex}>01</span>
                        <p>
                          Verbal advice is easy to forget once the appointment
                          ends.
                        </p>
                      </li>
                      <li className={styles.frictionItem}>
                        <span className={styles.frictionIndex}>02</span>
                        <p>
                          Paper is easy to lose, and PDFs are awkward to reopen
                          on a phone.
                        </p>
                      </li>
                      <li className={styles.frictionItem}>
                        <span className={styles.frictionIndex}>03</span>
                        <p>
                          Generic handouts weaken the clinic&apos;s own
                          identity.
                        </p>
                      </li>
                    </ol>
                  </MarketingReveal.Item>
                </div>
              </div>
            </MarketingReveal.Group>
          </section>

          <section className={styles.band} aria-labelledby="product-heading">
            <MarketingReveal.Group>
              <div className={`${styles.inner} ${styles.productGrid}`}>
                <MarketingReveal.Item>
                  <MarketingProductAssembly />
                </MarketingReveal.Item>
                <div className={styles.productCopy}>
                  <MarketingReveal.Item>
                    <p className={styles.eyebrow}>The product</p>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item>
                    <h2 id="product-heading">
                      A branded patient aftercare page that stays available.
                    </h2>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item>
                    <p className={styles.copy}>
                      {PRODUCT_NAME} gives each practice a durable, clinic-first
                      aftercare home. Patients reopen the same instructions in
                      the practice&apos;s look — without creating an account.
                    </p>
                  </MarketingReveal.Item>
                </div>
              </div>
            </MarketingReveal.Group>
          </section>

          <section
            id="how-it-works"
            className={styles.band}
            aria-labelledby="how-heading"
          >
            <MarketingReveal.Group>
              <div className={styles.inner}>
                <MarketingReveal.Item>
                  <p className={styles.eyebrow}>How it works</p>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <h2 id="how-heading" className={styles.sectionTitle}>
                    From approved guidance to a page patients keep
                  </h2>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <MarketingProcess />
                </MarketingReveal.Item>
              </div>
            </MarketingReveal.Group>
          </section>

          <section className={styles.band} aria-labelledby="why-heading">
            <MarketingReveal.Group>
              <div className={styles.inner}>
                <MarketingReveal.Item>
                  <p className={styles.eyebrow}>Why clinics use it</p>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <h2 id="why-heading" className={styles.sectionTitle}>
                    Clinic-first aftercare, built for rereading
                  </h2>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <MarketingPillars />
                </MarketingReveal.Item>
              </div>
            </MarketingReveal.Group>
          </section>
        </div>

        <div className={styles.marketingShowcase} data-mk-chapter="showcase">
          <section className={styles.band} aria-labelledby="brand-heading">
            <MarketingReveal.Group>
              <div className={styles.inner}>
                <MarketingReveal.Item>
                  <p className={styles.eyebrow}>Brand flexibility</p>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <h2 id="brand-heading" className={styles.sectionTitle}>
                    One product, many practice identities
                  </h2>
                  <p className={styles.copy}>
                    Choose a visual tone that feels at home with your practice
                    while the patient experience stays consistent and easy to
                    read.
                  </p>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <div className={styles.brandGrid}>
                    <article
                      className={`${styles.brandCard} ${styles.brandTeal}`}
                    >
                      <h3>Riverside Dental Demo</h3>
                      <p>
                        Calm clinical teal for a modern general dental practice.
                      </p>
                    </article>
                    <article
                      className={`${styles.brandCard} ${styles.brandNavy}`}
                    >
                      <h3>Specialist oral surgery</h3>
                      <p>Ink and navy for a quieter specialist tone.</p>
                    </article>
                    <article
                      className={`${styles.brandCard} ${styles.brandWarm}`}
                    >
                      <h3>Family dental</h3>
                      <p>
                        A warmer palette for a softer, more approachable
                        welcome.
                      </p>
                    </article>
                  </div>
                </MarketingReveal.Item>
              </div>
            </MarketingReveal.Group>
          </section>

          <section
            id="preview"
            className={styles.band}
            aria-labelledby="preview-heading"
          >
            <MarketingReveal.Group>
              <div className={`${styles.inner} ${styles.previewGrid}`}>
                <div className={styles.previewCopy}>
                  <MarketingReveal.Item>
                    <p className={styles.eyebrow}>Clinic preview</p>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item>
                    <h2 id="preview-heading">
                      See what patients actually receive
                    </h2>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item>
                    <p className={styles.copy}>
                      The Riverside Dental Demo shows the patient experience:
                      clinic branding, post-treatment instructions, and a
                      published Tooth Extraction guide.
                    </p>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item>
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
                <MarketingReveal.Item>
                  <MarketingPatientPreview />
                </MarketingReveal.Item>
              </div>
            </MarketingReveal.Group>
          </section>
        </div>

        <div className={styles.marketingClosing} data-mk-chapter="closing">
          <section
            id="early-access"
            className={styles.ctaBlock}
            aria-labelledby="cta-heading"
          >
            <MarketingReveal.Group>
              <div className={`${styles.inner} ${styles.earlyAccessLayout}`}>
                <div className={styles.earlyAccessPrimary}>
                  <MarketingReveal.Item>
                    <p className={styles.eyebrow}>Early access</p>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item>
                    <h2 id="cta-heading">
                      Talk to us about a design-partner clinic
                    </h2>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item>
                    <p className={styles.lede}>
                      {PRODUCT_NAME} is in early development. We&apos;re working
                      with a small number of clinics to help shape the first
                      commercial release.
                    </p>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item>
                    <div className={styles.actions}>
                      <a
                        className={`${styles.button} ${styles.primary}`}
                        href={demoHref}
                      >
                        View the clinic demo
                      </a>
                    </div>
                  </MarketingReveal.Item>
                </div>
                <MarketingReveal.Item>
                  <div className={styles.earlyAccessPartner}>
                    <p className={styles.eyebrow}>Design partner</p>
                    <h3 className={styles.partnerTitle}>
                      What we&apos;ll validate together
                    </h3>
                    <ol className={styles.partnerList}>
                      <li className={styles.partnerItem}>
                        <span className={styles.partnerIndex}>01</span>
                        <p>Guide setup</p>
                      </li>
                      <li className={styles.partnerItem}>
                        <span className={styles.partnerIndex}>02</span>
                        <p>Clinic branding</p>
                      </li>
                      <li className={styles.partnerItem}>
                        <span className={styles.partnerIndex}>03</span>
                        <p>Patient handoff</p>
                      </li>
                    </ol>
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
              <Link className={styles.textLink} href="#early-access">
                Early access
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
