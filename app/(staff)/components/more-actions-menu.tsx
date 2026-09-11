"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function MoreActionsMenu({
  label = "More actions",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  const menuId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="staffMore" ref={rootRef}>
      <button
        type="button"
        className="staffBtn staffBtnQuiet"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`more-${menuId}`}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      {open ? (
        <div
          id={`more-${menuId}`}
          role="menu"
          className="staffMoreMenu"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
