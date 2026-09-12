import type { Metadata } from "next";

import { geistMono, geistSans } from "@/lib/branding/fonts";
import { PRODUCT_NAME } from "@/lib/branding/product-name";
import { PRODUCT_ICONS } from "@/lib/seo/icons";
import { PRIVATE_ROBOTS } from "@/lib/seo/robots-policy";
import {
  PORTAL_THEME_STORAGE_KEY,
  themePreferenceBootstrapScript,
} from "@/lib/branding/theme-preference";

import "./staff.css";

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description: "Clinic aftercare portal for Aftercare Guide.",
  robots: PRIVATE_ROBOTS,
  icons: PRODUCT_ICONS,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: themePreferenceBootstrapScript(PORTAL_THEME_STORAGE_KEY),
          }}
        />
        {children}
      </body>
    </html>
  );
}
