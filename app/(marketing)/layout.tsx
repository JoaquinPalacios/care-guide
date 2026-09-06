import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./marketing.css";

export const metadata: Metadata = {
  title: "Care Guide — Branded aftercare for clinics",
  description:
    "Give patients clear, branded, mobile-first post-operative instructions they can reopen any time — without paper handouts or generic PDFs.",
};

export default function MarketingRootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
