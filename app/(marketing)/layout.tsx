import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PRODUCT_NAME } from "@/lib/branding/product-name";
import {
  HOME_METADATA,
  MARKETING_TITLE_TEMPLATE,
  marketingMetadataBase,
  marketingPageMetadata,
} from "@/lib/marketing/metadata";
import { PRODUCT_ICONS } from "@/lib/seo/icons";
import { marketingMotionBootstrapScript } from "@/lib/marketing/motion-bootstrap";
import {
  MARKETING_THEME_STORAGE_KEY,
  themePreferenceBootstrapScript,
} from "@/lib/branding/theme-preference";

import "./marketing.css";

const homeMetadata = marketingPageMetadata(HOME_METADATA, {
  pathname: "/",
  absoluteTitle: true,
});

export const metadata: Metadata = {
  metadataBase: marketingMetadataBase(),
  title: {
    default: HOME_METADATA.title,
    template: MARKETING_TITLE_TEMPLATE,
  },
  description: HOME_METADATA.description,
  robots: homeMetadata.robots,
  icons: PRODUCT_ICONS,
  alternates: homeMetadata.alternates,
  openGraph: homeMetadata.openGraph,
  twitter: homeMetadata.twitter,
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: PRODUCT_NAME,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: HOME_METADATA.description,
};

export default function MarketingRootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: themePreferenceBootstrapScript(MARKETING_THEME_STORAGE_KEY),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: marketingMotionBootstrapScript(),
          }}
        />
        <noscript>
          <style>
            {
              "html[data-mk-motion] .mkReveal{opacity:1!important;transform:none!important;animation:none!important}"
            }
          </style>
        </noscript>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareJsonLd),
          }}
        />
      </body>
    </html>
  );
}
