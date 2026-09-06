import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PRODUCT_NAME } from "@/lib/branding/product-name";
import {
  MARKETING_THEME_STORAGE_KEY,
  themePreferenceBootstrapScript,
} from "@/lib/branding/theme-preference";

import "./marketing.css";

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} — Aftercare that still feels like your clinic`,
  description:
    "Turn approved post-treatment instructions into branded, mobile-first pages patients can reopen whenever they need them. No app. No login. No PDF to hunt down.",
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
        {children}
      </body>
    </html>
  );
}
