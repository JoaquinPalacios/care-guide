"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/operator/clinics", label: "Clinics" },
  { href: "/operator/seo", label: "SEO & Discovery" },
] as const;

export function OperatorPlatformNav() {
  const pathname = usePathname();

  return (
    <nav className="staffNavGroup" aria-label="Platform">
      {LINKS.map((link) => {
        const current =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className="staffNavRow"
            aria-current={current ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
