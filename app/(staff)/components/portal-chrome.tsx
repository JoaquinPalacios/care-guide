"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { LogoutButton } from "@/app/(staff)/components/logout-button";
import { ProductMark } from "@/app/(staff)/components/product-mark";
import { PRODUCT_NAME } from "@/lib/branding/product-name";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/guides", label: "Guides" },
] as const;

export function PortalChrome({
  displayName,
  userLabel,
  roleLabel,
  patientSiteHref,
  children,
}: {
  displayName: string;
  userLabel: string;
  roleLabel: string;
  patientSiteHref: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const reactId = useId().replace(/:/g, "");
  const menuId = `portal-nav-${reactId}`;
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) {
      return;
    }

    const sync = () => setOpen(menu.matches(":popover-open"));
    menu.addEventListener("toggle", sync);
    return () => menu.removeEventListener("toggle", sync);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        menuRef.current?.hidePopover();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="flex min-h-screen bg-staff-canvas text-staff-ink">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-staff-line bg-staff-panel md:flex">
        <PortalBrand displayName={displayName} />
        <PortalNav
          pathname={pathname}
          patientSiteHref={patientSiteHref}
          onNavigate={() => undefined}
        />
        <PortalAccount userLabel={userLabel} roleLabel={roleLabel} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-staff-line bg-staff-panel px-4 py-3 md:hidden">
          <PortalBrand displayName={displayName} compact />
          <button
            ref={triggerRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-staff-line text-staff-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
            popoverTarget={menuId}
            popoverTargetAction="toggle"
            aria-haspopup="true"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label="Clinic portal menu"
          >
            <span className="flex flex-col gap-1" aria-hidden="true">
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
            </span>
          </button>
          <div
            ref={menuRef}
            id={menuId}
            popover="auto"
            className="inset-auto top-[3.6rem] right-3 left-3 m-0 w-auto max-w-none overflow-hidden rounded-xl border border-staff-line bg-staff-panel p-2 text-staff-ink shadow-lg"
          >
            <PortalNav
              pathname={pathname}
              patientSiteHref={patientSiteHref}
              onNavigate={() => menuRef.current?.hidePopover()}
            />
            <PortalAccount userLabel={userLabel} roleLabel={roleLabel} />
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function PortalBrand({
  displayName,
  compact = false,
}: {
  displayName: string;
  compact?: boolean;
}) {
  return (
    <div
      className={compact ? "min-w-0" : "border-b border-staff-line px-5 py-5"}
    >
      <p className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <ProductMark className="h-5 w-5 text-staff-brand" />
        {PRODUCT_NAME}
      </p>
      <p className="mt-1 truncate text-sm text-staff-muted">{displayName}</p>
    </div>
  );
}

function PortalNav({
  pathname,
  patientSiteHref,
  onNavigate,
}: {
  pathname: string;
  patientSiteHref: string | null;
  onNavigate: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Clinic portal">
      {NAV_ITEMS.map((item) => {
        const current =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            onClick={onNavigate}
            className={`flex min-h-11 items-center rounded-md px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand ${
              current
                ? "bg-staff-brand/10 text-staff-brand"
                : "text-staff-ink hover:bg-staff-canvas"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      {patientSiteHref ? (
        <a
          href={patientSiteHref}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-staff-muted hover:bg-staff-canvas hover:text-staff-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
        >
          View patient site
          <span className="sr-only"> (opens in a new tab)</span>
          <span aria-hidden="true" className="ml-1">
            ↗
          </span>
        </a>
      ) : null}
    </nav>
  );
}

function PortalAccount({
  userLabel,
  roleLabel,
}: {
  userLabel: string;
  roleLabel: string;
}) {
  return (
    <div className="mt-auto border-t border-staff-line p-4">
      <p className="truncate text-sm font-medium text-staff-ink">{userLabel}</p>
      <p className="mt-0.5 text-xs text-staff-muted">{roleLabel}</p>
      <LogoutButton className="mt-3 flex flex-col items-start gap-2" />
    </div>
  );
}
