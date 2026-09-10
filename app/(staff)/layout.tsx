import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PRODUCT_NAME } from "@/lib/branding/product-name";
import {
  PORTAL_THEME_STORAGE_KEY,
  themePreferenceBootstrapScript,
} from "@/lib/branding/theme-preference";

import "./staff.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description: "Clinic aftercare portal for Aftercare Guide.",
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
