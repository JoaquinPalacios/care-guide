import type { Metadata } from "next";
import type { ReactNode } from "react";

import { geistSans } from "@/lib/branding/fonts";
import {
  HOME_METADATA,
  MARKETING_TITLE_TEMPLATE,
  marketingMetadataBase,
} from "@/lib/marketing/metadata";
import { generateMarketingMetadata } from "@/lib/seo/marketing-page";
import { PRODUCT_HEAD_METADATA } from "@/lib/seo/icons";
import { marketingMotionBootstrapScript } from "@/lib/marketing/motion-bootstrap";
import {
  MARKETING_THEME_STORAGE_KEY,
  themePreferenceBootstrapScript,
} from "@/lib/branding/theme-preference";

import "./marketing.css";

export async function generateMetadata(): Promise<Metadata> {
  const page = await generateMarketingMetadata("/");
  return {
    metadataBase: marketingMetadataBase(),
    title: {
      default: HOME_METADATA.title,
      template: MARKETING_TITLE_TEMPLATE,
    },
    description: page.description,
    robots: page.robots,
    ...PRODUCT_HEAD_METADATA,
    alternates: page.alternates,
    openGraph: page.openGraph,
    twitter: page.twitter,
  };
}

export default function MarketingRootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable} suppressHydrationWarning>
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
      </body>
    </html>
  );
}
