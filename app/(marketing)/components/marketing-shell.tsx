import Link from "next/link";
import type { ReactNode } from "react";

import { MarketingExperience } from "@/app/(marketing)/components/marketing-experience";
import { MarketingMark } from "@/app/(marketing)/components/marketing-mark";
import { MarketingNavMenu } from "@/app/(marketing)/components/marketing-nav-menu";
import { MarketingThemeControl } from "@/app/(marketing)/components/marketing-theme-control";
import { PRODUCT_NAME } from "@/lib/branding/product-name";
import { homepageAnchor } from "@/lib/marketing/public-links";

import styles from "../marketing.module.css";

export type MarketingPath = "/" | "/pricing" | "/contact";

export function MarketingShell({
  currentPath,
  staffHref,
  children,
}: {
  currentPath: MarketingPath;
  staffHref: string;
  children: ReactNode;
}) {
  const howItWorksHref = homepageAnchor(currentPath, "how-it-works");
  const previewHref = homepageAnchor(currentPath, "preview");
  const menuItems = [
    {
      href: "/pricing",
      label: "Pricing",
      current: currentPath === "/pricing",
    },
    {
      href: "/contact",
      label: "Contact",
      current: currentPath === "/contact",
    },
  ];

  return (
    <MarketingExperience className={styles.page}>
      <header className={`${styles.top} ${styles.marketingBase}`}>
        <div className={styles.topInner}>
          <Link className={styles.wordmark} href="/">
            <MarketingMark className={styles.mark} />
            {PRODUCT_NAME}
          </Link>
          <nav className={styles.nav} aria-label="Marketing">
            <Link
              className={`${styles.navRoute} ${styles.textLink}`}
              href="/pricing"
              aria-current={currentPath === "/pricing" ? "page" : undefined}
            >
              Pricing
            </Link>
            <Link
              className={`${styles.navRoute} ${styles.textLink}`}
              href="/contact"
              aria-current={currentPath === "/contact" ? "page" : undefined}
            >
              Contact
            </Link>
            <a
              className={`${styles.navStaff} ${styles.textLink}`}
              href={staffHref}
            >
              Staff sign in
            </a>
            <span className={styles.navTheme}>
              <MarketingThemeControl />
            </span>
            <MarketingNavMenu items={menuItems} staffHref={staffHref} />
          </nav>
        </div>
      </header>
      {children}
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
              <Link className={styles.textLink} href={howItWorksHref}>
                How it works
              </Link>
              <Link className={styles.textLink} href={previewHref}>
                Clinic preview
              </Link>
              <Link className={styles.textLink} href="/pricing">
                Pricing
              </Link>
              <Link className={styles.textLink} href="/contact">
                Contact
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
