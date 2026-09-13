import type { Metadata } from "next";

import { PRODUCT_NAME } from "@/lib/branding/product-name";
import { INDEXABLE_ROBOTS } from "@/lib/seo/robots-policy";
import { DEFAULT_MARKETING_PAGE_SEO } from "@/lib/seo/defaults";
import { marketingSiteOrigin } from "@/lib/marketing/site";
import {
  marketingCanonicalUrl,
  marketingSeoToMetadata,
  resolveMarketingSeo,
} from "@/lib/seo/resolve-marketing-seo";

export const MARKETING_TITLE_TEMPLATE = `%s — ${PRODUCT_NAME}`;

export const HOME_METADATA = {
  title: DEFAULT_MARKETING_PAGE_SEO["/"].seoTitle,
  description: DEFAULT_MARKETING_PAGE_SEO["/"].metaDescription,
} as const;

export const PRICING_METADATA = {
  title: DEFAULT_MARKETING_PAGE_SEO["/pricing"].seoTitle,
  description: DEFAULT_MARKETING_PAGE_SEO["/pricing"].metaDescription,
} as const;

export const CONTACT_METADATA = {
  title: DEFAULT_MARKETING_PAGE_SEO["/contact"].seoTitle,
  description: DEFAULT_MARKETING_PAGE_SEO["/contact"].metaDescription,
} as const;

export const ABOUT_METADATA = {
  title: DEFAULT_MARKETING_PAGE_SEO["/about"].seoTitle,
  description: DEFAULT_MARKETING_PAGE_SEO["/about"].metaDescription,
} as const;

export const PRIVACY_METADATA = {
  title: DEFAULT_MARKETING_PAGE_SEO["/privacy"].seoTitle,
  description: DEFAULT_MARKETING_PAGE_SEO["/privacy"].metaDescription,
} as const;

export const TERMS_METADATA = {
  title: DEFAULT_MARKETING_PAGE_SEO["/terms"].seoTitle,
  description: DEFAULT_MARKETING_PAGE_SEO["/terms"].metaDescription,
} as const;

export function marketingMetadataBase(
  env: NodeJS.ProcessEnv = process.env
): URL {
  return new URL(`${marketingSiteOrigin(env)}/`);
}

export function marketingPageMetadata(
  input: {
    title: string;
    description: string;
  },
  options: {
    pathname: "/" | "/pricing" | "/contact" | "/about" | "/privacy" | "/terms";
    absoluteTitle?: boolean;
  }
): Metadata {
  const origin = marketingSiteOrigin();
  const resolved = resolveMarketingSeo({
    path: options.pathname,
    origin,
    page: {
      path: options.pathname,
      seoTitle: input.title,
      metaDescription: input.description,
      ogTitle: null,
      ogDescription: null,
      ogImagePath: null,
      index: INDEXABLE_ROBOTS.index,
      follow: INDEXABLE_ROBOTS.follow,
      updatedAt: null,
    },
  });
  const metadata = marketingSeoToMetadata(resolved);
  if (options.absoluteTitle) {
    return metadata;
  }
  return {
    ...metadata,
    title: input.title,
  };
}

export { marketingCanonicalUrl };
