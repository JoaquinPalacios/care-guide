import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./aftercare.css";

export const metadata: Metadata = {
  title: "Aftercare",
  description: "Patient aftercare guides.",
  robots: { index: false, follow: false },
};

export default function AftercareRootLayout({
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
