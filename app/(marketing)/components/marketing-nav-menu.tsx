"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { MarketingNavTheme } from "@/app/(marketing)/components/marketing-nav-theme";

import styles from "../marketing.module.css";

export type MarketingMenuItem = {
  href: string;
  label: string;
  current?: boolean;
};

export function MarketingNavMenu({
  items,
  staffHref,
}: {
  items: MarketingMenuItem[];
  staffHref: string;
}) {
  const reactId = useId().replace(/:/g, "");
  const menuId = `mk-nav-${reactId}`;
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) {
      return;
    }

    const sync = () => {
      const nextOpen = menu.matches(":popover-open");
      setOpen(nextOpen);
      if (nextOpen) {
        const first = menu.querySelector("a");
        if (first instanceof HTMLElement) {
          first.focus();
        }
      }
    };

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
    <div className={styles.navMenu}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.navMenuTrigger}
        popoverTarget={menuId}
        popoverTargetAction="toggle"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Site menu"
      >
        <span className={styles.navMenuGlyph} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        className={styles.navMenuPanel}
      >
        <ul className={styles.navMenuList}>
          {items.map((item) => (
            <li key={item.label}>
              <Link
                className={styles.navMenuRow}
                href={item.href}
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <a className={styles.navMenuRow} href={staffHref}>
              Staff sign in
            </a>
          </li>
          <li>
            <MarketingNavTheme />
          </li>
        </ul>
      </div>
    </div>
  );
}
