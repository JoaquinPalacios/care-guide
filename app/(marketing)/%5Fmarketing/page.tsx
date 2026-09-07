import { headers } from "next/headers";
import Link from "next/link";

import {
  MarketingExperience,
  MarketingRevealGroup,
  MarketingRevealHero,
  MarketingRevealItem,
  MarketingRevealPreview,
} from "@/app/(marketing)/components/marketing-experience";
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
            <Link href="#how-it-works">How it works</Link>
            <Link href="#preview">Clinic preview</Link>
            <Link href="#early-access">Early access</Link>
            <a href={staffHref}>Staff sign in</a>
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
          <MarketingReveal.Hero>
            <div className={`${styles.inner} ${styles.heroLayout}`}>
              <div className={styles.heroStatement}>
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
                      mobile-first pages patients can reopen whenever they need
                      them. No app. No login. No PDF to hunt down.
                    </p>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item>
                    <div className={`${styles.actions} ${styles.heroActions}`}>
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
        </section>

        <MarketingWave />

        <div className={styles.marketingSoft} data-mk-chapter="soft">
          <section className={styles.band} aria-labelledby="problem-heading">
            <MarketingReveal.Group>
              <div className={`${styles.inner} ${styles.problemGrid}`}>
                <MarketingReveal.Item>
                  <div>
                    <p className={styles.eyebrow}>The problem</p>
                    <h2 id="problem-heading" className={styles.problemTitle}>
                      Patients leave with instructions. They don&apos;t always
                      leave with clarity.
                    </h2>
                  </div>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <ul className={styles.problemList}>
                    <li>
                      Verbal advice is easy to forget once the appointment ends.
                    </li>
                    <li>Paper is easy to lose between the chair and home.</li>
                    <li>PDFs are awkward to reopen on a phone.</li>
                    <li>
                      Generic handouts weaken the clinic&apos;s own identity.
                    </li>
                    <li>
                      Patients often need the same instructions again days
                      later.
                    </li>
                    <li>
                      Unclear aftercare creates avoidable calls and follow-up
                      questions.
                    </li>
                  </ul>
                </MarketingReveal.Item>
              </div>
            </MarketingReveal.Group>
          </section>

          <section className={styles.band} aria-labelledby="product-heading">
            <MarketingReveal.Group>
              <div className={`${styles.inner} ${styles.productGrid}`}>
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
                  <h2 id="how-heading">
                    From approved guidance to a page patients keep
                  </h2>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <span className={styles.stepIndex}>Step 1</span>
                      <h3>Select guides</h3>
                      <p>
                        The clinic enables the recovery guides that match the
                        care it provides.
                      </p>
                    </li>
                    <li className={styles.step}>
                      <span className={styles.stepIndex}>Step 2</span>
                      <h3>Apply clinic brand</h3>
                      <p>
                        Colour, logo, terminology, and a controlled visual tone
                        make the pages feel like the practice.
                      </p>
                    </li>
                    <li className={styles.step}>
                      <span className={styles.stepIndex}>Step 3</span>
                      <h3>Share a durable link</h3>
                      <p>
                        Patients receive a URL they can save. Designed for QR
                        handoff; QR tooling is next, not a dashboard in this
                        release.
                      </p>
                    </li>
                    <li className={styles.step}>
                      <span className={styles.stepIndex}>Step 4</span>
                      <h3>Patient revisits anytime</h3>
                      <p>
                        The same instructions stay available after the
                        appointment, on a phone-sized layout.
                      </p>
                    </li>
                  </ol>
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
                  <h2 id="why-heading">
                    Clinic-first aftercare, built for rereading
                  </h2>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <ul className={styles.reasons}>
                    <li>
                      <h3>Clinic-first presence</h3>
                      <p>
                        Patients see the practice name, colours, and contact
                        details — not a generic platform dashboard.
                      </p>
                    </li>
                    <li>
                      <h3>Mobile reading</h3>
                      <p>
                        Typography, spacing, and actions are designed for a
                        phone at home, not a waiting-room printout.
                      </p>
                    </li>
                    <li>
                      <h3>Durable URLs</h3>
                      <p>
                        Guides live at stable addresses the clinic can share by
                        link now, and later attach to a QR-ready handoff.
                      </p>
                    </li>
                    <li>
                      <h3>Practice contact</h3>
                      <p>
                        Call the practice from the same page as the
                        instructions, plus a distinct urgent-help block.
                      </p>
                    </li>
                    <li>
                      <h3>Controlled customisation</h3>
                      <p>
                        Clinics choose colour, accent, surface tone, radius,
                        terminology, and theme policy. Arbitrary CSS is not part
                        of the model.
                      </p>
                    </li>
                    <li>
                      <h3>Managed guide library</h3>
                      <p>
                        Practices enable reviewed recovery guides rather than
                        assembling a website from scratch.
                      </p>
                    </li>
                  </ul>
                </MarketingReveal.Item>
              </div>
            </MarketingReveal.Group>
          </section>
        </div>

        <div className={styles.blendToShowcase} aria-hidden="true" />

        <div className={styles.marketingShowcase} data-mk-chapter="showcase">
          <section className={styles.band} aria-labelledby="brand-heading">
            <MarketingReveal.Group>
              <div className={styles.inner}>
                <MarketingReveal.Item>
                  <p className={styles.eyebrow}>Branding</p>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <h2 id="brand-heading">
                    One product, many practice identities
                  </h2>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <p className={styles.copy}>
                    Tenant pages keep the clinic&apos;s colours. The{" "}
                    {PRODUCT_NAME} marketing brand stays separate, so a green
                    dental practice does not inherit a platform look.
                  </p>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <div className={styles.brandGrid}>
                    <article
                      className={`${styles.brandCard} ${styles.brandTeal}`}
                    >
                      <h3>Riverside Dental Demo</h3>
                      <p>Warm clinical teal for a general dental practice.</p>
                    </article>
                    <article
                      className={`${styles.brandCard} ${styles.brandNavy}`}
                    >
                      <h3>Specialist oral surgery</h3>
                      <p>Ink and navy for a calmer specialist presence.</p>
                    </article>
                    <article
                      className={`${styles.brandCard} ${styles.brandWarm}`}
                    >
                      <h3>Family practice</h3>
                      <p>
                        A warmer accent when the clinic wants a softer welcome.
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
                      See a branded aftercare home, not a staff console
                    </h2>
                  </MarketingReveal.Item>
                  <MarketingReveal.Item>
                    <p className={styles.copy}>
                      The Riverside Dental Demo tenant shows the patient
                      experience: a practice header, post-treatment
                      instructions, and a published Tooth Extraction guide.
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
                  <p className={styles.copy}>
                    A calm clinic resource page. Not a login. Not a feed. Just
                    the recovery information the practice wants patients to
                    keep.
                  </p>
                </MarketingReveal.Item>
              </div>
            </MarketingReveal.Group>
          </section>
        </div>

        <div className={styles.blendToClosing} aria-hidden="true" />

        <div className={styles.marketingClosing} data-mk-chapter="closing">
          <section
            id="early-access"
            className={styles.ctaBlock}
            aria-labelledby="cta-heading"
          >
            <MarketingReveal.Group>
              <div className={styles.inner}>
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
                    This is an early product. Pricing is not locked, and
                    operator admin is not in this release. Start with the public
                    demo, then continue the conversation from there.
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
                    <a
                      className={`${styles.button} ${styles.secondary}`}
                      href={staffHref}
                    >
                      Open staff sign in
                    </a>
                  </div>
                </MarketingReveal.Item>
                <MarketingReveal.Item>
                  <p className={styles.fine}>
                    {PRODUCT_NAME} is the current provisional commercial name
                    for this aftercare product.
                  </p>
                </MarketingReveal.Item>
              </div>
            </MarketingReveal.Group>
          </section>
        </div>
      </main>
      <footer className={`${styles.footer} ${styles.marketingClosing}`}>
        <div className={`${styles.inner} ${styles.footerInner}`}>
          <div className={styles.footerBrand}>
            <p className={styles.footerName}>{PRODUCT_NAME}</p>
            <p className={styles.footerTag}>
              Branded aftercare patients can revisit.
            </p>
          </div>
          <nav className={styles.footerNav} aria-label="Footer">
            <Link href="#how-it-works">How it works</Link>
            <Link href="#preview">Clinic preview</Link>
            <Link href="#early-access">Early access</Link>
            <a href={staffHref}>Staff sign in</a>
          </nav>
        </div>
        <div className={styles.inner}>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} {PRODUCT_NAME}
          </p>
        </div>
      </footer>
    </MarketingExperience>
  );
}
