"use client";

import { useId, useRef, type ReactNode } from "react";

export function OverflowMenu({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const reactId = useId().replace(/:/g, "");
  const menuId = `overflow-${reactId}`;
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <button
        type="button"
        className="staffBtn staffBtnQuiet px-2"
        popoverTarget={menuId}
        popoverTargetAction="toggle"
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={label}
      >
        <span aria-hidden="true">⋯</span>
      </button>
      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        role="menu"
        className="staffOverflowMenu"
      >
        {children}
      </div>
    </div>
  );
}
