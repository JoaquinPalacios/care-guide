import Link from "next/link";
import type { ReactNode } from "react";

import { MarketingExperience } from "@/app/(marketing)/components/marketing-experience";
import { MarketingNavMenu } from "@/app/(marketing)/components/marketing-nav-menu";
import { MarketingThemeControl } from "@/app/(marketing)/components/marketing-theme-control";
import { ProductLogo } from "@/lib/branding/product-logo";
import { ProductMark } from "@/lib/branding/product-mark";
import { PRODUCT_NAME } from "@/lib/branding/product-name";
import type { MarketingSeoPath } from "@/lib/seo/types";

import styles from "../marketing.module.css";

export type MarketingPath = MarketingSeoPath;

const FOOTER_GROUPS = [
  {
    id: "product",
    label: "Product",
    links: [
      { href: "/about", label: "About" },
      { href: "/pricing", label: "Pricing" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    id: "legal",
    label: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
] as const;

export function MarketingShell({
  currentPath,
  staffHref,
  children,
}: {
  currentPath: MarketingPath;
  staffHref: string;
  children: ReactNode;
}) {
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
          <Link className={styles.wordmark} href="/" aria-label={PRODUCT_NAME}>
            <ProductLogo className={styles.logo} />
            <span className={styles.wordmarkName}>
              <ProductMark className={styles.mark} />
              {PRODUCT_NAME}
            </span>
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
              <p className={styles.footerName}>
                <ProductMark className={styles.footerMark} />
                {PRODUCT_NAME}
              </p>
              <p className={styles.footerTag}>
                Clinic-branded aftercare patients can revisit.
              </p>
            </div>
            <nav className={styles.footerNav} aria-label="Footer">
              {FOOTER_GROUPS.map((group) => (
                <div key={group.id} className={styles.footerNavGroup}>
                  <p className={styles.footerNavLabel} id={`footer-${group.id}`}>
                    {group.label}
                  </p>
                  <ul
                    className={styles.footerNavList}
                    aria-labelledby={`footer-${group.id}`}
                  >
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          className={styles.textLink}
                          href={link.href}
                          aria-current={
                            currentPath === link.href ? "page" : undefined
                          }
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className={styles.footerNavGroup}>
                <p className={styles.footerNavLabel} id="footer-account">
                  Account
                </p>
                <ul
                  className={styles.footerNavList}
                  aria-labelledby="footer-account"
                >
                  <li>
                    <a className={styles.textLink} href={staffHref}>
                      Staff sign in
                    </a>
                  </li>
                </ul>
              </div>
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
