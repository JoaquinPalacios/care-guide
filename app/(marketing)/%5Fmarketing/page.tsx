import { headers } from "next/headers";
import Link from "next/link";

import { DEMO_AFTERCARE_TENANT_SLUG } from "@/lib/aftercare/demo-tenant";
import { labeledPublicUrl } from "@/lib/tenancy/public-url";
import { getRootDomain } from "@/lib/tenancy/root-domain";

import styles from "../marketing.module.css";

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
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.topInner}>
          <Link className={styles.wordmark} href="/">
            Care Guide
          </Link>
          <nav className={styles.nav} aria-label="Marketing">
            <Link href="#how-it-works">How it works</Link>
            <Link href="#preview">Clinic preview</Link>
            <a href={staffHref}>Staff sign in</a>
          </nav>
        </div>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="marketing-hero">
          <div className={`${styles.inner} ${styles.heroGrid}`}>
            <div>
              <p className={styles.eyebrow}>Aftercare platform</p>
              <h1 id="marketing-hero">
                Post-operative instructions patients can actually follow
              </h1>
              <p className={styles.lede}>
                Care Guide gives clinics branded, mobile-first recovery pages —
                so patients leave with a permanent link instead of a paper
                handout or a PDF they will not reopen.
              </p>
              <div className={styles.actions}>
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
            </div>
            <aside className={styles.preview} aria-label="Product preview">
              <div className={styles.previewBar} aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className={styles.previewCard}>
                <div className={styles.previewBrand}>Riverside Dental Demo</div>
                <div className={styles.previewBody}>
                  <p>Post-operative instructions</p>
                  <span className={styles.previewRow}>Tooth Extraction</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className={`${styles.band} ${styles.mutedBand}`}>
          <div className={`${styles.inner} ${styles.split}`}>
            <div>
              <p className={styles.eyebrow}>The problem</p>
              <h2>Paper and PDFs disappear at the moment patients need them</h2>
              <p className={styles.copy}>
                Traditional aftercare is easy to lose and hard to read. Generic
                printouts look the same from every clinic. PDFs fight small
                screens. Weak websites bury the few lines a patient is looking
                for after they get home.
              </p>
            </div>
            <div className={styles.card}>
              <h3>A calmer alternative</h3>
              <p>
                Each practice gets a branded aftercare home and durable guide
                pages. Patients reopen clear instructions on their phone, in the
                clinic’s look, whenever they need them.
              </p>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className={styles.band}
          aria-labelledby="how-heading"
        >
          <div className={styles.inner}>
            <p className={styles.eyebrow}>How it works</p>
            <h2 id="how-heading">From the chair to a page patients keep</h2>
            <ol className={styles.steps}>
              <li className={styles.step}>
                <span className={styles.stepIndex}>Step 1</span>
                <h3>Select procedures</h3>
                <p>
                  The clinic enables the recovery guides that match the care it
                  provides.
                </p>
              </li>
              <li className={styles.step}>
                <span className={styles.stepIndex}>Step 2</span>
                <h3>Apply clinic branding</h3>
                <p>
                  Colour, logo, and a controlled visual tone make the pages feel
                  like the practice.
                </p>
              </li>
              <li className={styles.step}>
                <span className={styles.stepIndex}>Step 3</span>
                <h3>Share a durable link</h3>
                <p>
                  Patients receive a URL they can save. QR handoff is part of
                  the product direction.
                </p>
              </li>
              <li className={styles.step}>
                <span className={styles.stepIndex}>Step 4</span>
                <h3>Revisit anytime</h3>
                <p>
                  The same instructions stay available after the appointment, on
                  a phone-sized layout.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section className={`${styles.band} ${styles.mutedBand}`}>
          <div className={styles.inner}>
            <p className={styles.eyebrow}>Why clinics use it</p>
            <h2>Branded aftercare that is built for the way patients read</h2>
            <ul className={styles.features}>
              <li className={styles.feature}>
                <h3>Clinic-first pages</h3>
                <p>
                  Patients see the practice name, not a generic platform
                  dashboard.
                </p>
              </li>
              <li className={styles.feature}>
                <h3>Mobile-first reading</h3>
                <p>
                  Typography, spacing, and actions are designed for a phone in a
                  quiet evening at home.
                </p>
              </li>
              <li className={styles.feature}>
                <h3>Permanent URLs</h3>
                <p>
                  Guides live at stable addresses the clinic can print, send, or
                  later attach to a QR code.
                </p>
              </li>
              <li className={styles.feature}>
                <h3>Contact when it matters</h3>
                <p>
                  Call and booking actions sit with the instructions, plus a
                  distinct urgent-help block.
                </p>
              </li>
              <li className={styles.feature}>
                <h3>Controlled customisation</h3>
                <p>
                  Clinics choose colour, accent, surface tone, and corner
                  radius. Arbitrary CSS is not part of the model.
                </p>
              </li>
              <li className={styles.feature}>
                <h3>Built to grow with the practice</h3>
                <p>
                  Publishing, analytics, and operator tools are on the roadmap.
                  The patient page is already the public face.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section
          id="preview"
          className={styles.band}
          aria-labelledby="preview-heading"
        >
          <div className={`${styles.inner} ${styles.split}`}>
            <div>
              <p className={styles.eyebrow}>Clinic preview</p>
              <h2 id="preview-heading">
                See a branded aftercare home, not a staff console
              </h2>
              <p className={styles.copy}>
                The Riverside Dental Demo tenant shows the patient experience: a
                practice header, post-operative instructions, and a published
                Tooth Extraction guide.
              </p>
              <div className={styles.actions}>
                <a
                  className={`${styles.button} ${styles.primary}`}
                  href={demoHref}
                >
                  Open Riverside Dental Demo
                </a>
              </div>
            </div>
            <div className={styles.card}>
              <h3>What patients get</h3>
              <p>
                A calm clinic resource page. Not a login. Not a feed. Just the
                recovery information the practice wants them to have.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.ctaBlock} aria-labelledby="cta-heading">
          <div className={styles.inner}>
            <p className={styles.eyebrow}>Next step</p>
            <h2 id="cta-heading">Show the aftercare experience to a clinic</h2>
            <p className={styles.lede}>
              Start with the public demo, then use the staff app for the parked
              internal workspace. A full clinic admin is not in this release.
            </p>
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
            <p className={styles.fine}>
              Care Guide is the working platform label for this aftercare
              product.
            </p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.inner}>Care Guide — aftercare platform</div>
      </footer>
    </div>
  );
}
