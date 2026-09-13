import { PRODUCT_NAME } from "@/lib/branding/product-name";
import type {
  MarketingPageSeoInput,
  MarketingSeoPath,
  PlatformSeoIdentity,
} from "@/lib/seo/types";

export const DEFAULT_PLATFORM_SEO: PlatformSeoIdentity = {
  siteName: PRODUCT_NAME,
  defaultDescription:
    "Branded, mobile-first aftercare pages that still feel like your clinic. Patients reopen procedure-specific guidance without an app or login.",
  organizationName: PRODUCT_NAME,
  organizationDescription: `${PRODUCT_NAME} is a branded, web-first aftercare platform for healthcare practices. Clinics publish clinic-branded patient instructions. The first vertical is dental.`,
  publicContactEmail: null,
  defaultOgImagePath: null,
  sameAsUrls: [],
  updatedAt: null,
};

export const DEFAULT_MARKETING_PAGE_SEO: Record<
  MarketingSeoPath,
  Omit<MarketingPageSeoInput, "path" | "updatedAt">
> = {
  "/": {
    seoTitle: `${PRODUCT_NAME} — Branded patient aftercare`,
    metaDescription: DEFAULT_PLATFORM_SEO.defaultDescription,
    ogTitle: null,
    ogDescription: null,
    ogImagePath: null,
    index: true,
    follow: true,
  },
  "/pricing": {
    seoTitle: "Pricing",
    metaDescription: `Provisional ${PRODUCT_NAME} plans for dental practices: Essential at A$79 a month, Practice at A$149 a month, and custom Group pricing.`,
    ogTitle: null,
    ogDescription: null,
    ogImagePath: null,
    index: true,
    follow: true,
  },
  "/contact": {
    seoTitle: "Contact",
    metaDescription: `Request a ${PRODUCT_NAME} demo. Tell us about your practice and we will set up branded aftercare pages with you.`,
    ogTitle: null,
    ogDescription: null,
    ogImagePath: null,
    index: true,
    follow: true,
  },
  "/about": {
    seoTitle: "About",
    metaDescription: `${PRODUCT_NAME} is a branded aftercare platform for healthcare practices. Clinics publish web-first, clinic-branded patient instructions. Dental is the first vertical.`,
    ogTitle: null,
    ogDescription: null,
    ogImagePath: null,
    index: true,
    follow: true,
  },
  "/privacy": {
    seoTitle: "Privacy Policy",
    metaDescription: `How ${PRODUCT_NAME} handles information on the public website, clinic accounts, and patient aftercare pages. Draft for legal review.`,
    ogTitle: null,
    ogDescription: null,
    ogImagePath: null,
    index: true,
    follow: true,
  },
  "/terms": {
    seoTitle: "Terms & Conditions",
    metaDescription: `Draft terms for using ${PRODUCT_NAME}, a B2B aftercare publishing platform for healthcare practices. Not a substitute for legal advice.`,
    ogTitle: null,
    ogDescription: null,
    ogImagePath: null,
    index: true,
    follow: true,
  },
};

export const MARKETING_PAGE_LABELS: Record<MarketingSeoPath, string> = {
  "/": "Home",
  "/pricing": "Pricing",
  "/contact": "Contact",
  "/about": "About",
  "/privacy": "Privacy Policy",
  "/terms": "Terms & Conditions",
};

export const TITLE_GUIDE_LENGTH = 60;
export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_GUIDE_LENGTH = 160;
export const DESCRIPTION_MAX_LENGTH = 320;
export const ORGANIZATION_DESCRIPTION_MAX_LENGTH = 400;
export const SITE_NAME_MAX_LENGTH = 80;
