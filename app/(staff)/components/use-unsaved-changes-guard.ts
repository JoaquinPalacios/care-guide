"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function useUnsavedChangesGuard(dirty: boolean) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState<string | null>(null);

  const requestLeave = useCallback(
    (nextHref: string) => {
      if (!dirty) {
        router.push(nextHref);
        return;
      }

      setHref(nextHref);
      setOpen(true);
    },
    [dirty, router]
  );

  useEffect(() => {
    if (!dirty) {
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) {
      return;
    }

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!target || target.closest("dialog")) {
        return;
      }

      const anchor = target.closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const raw = anchor.getAttribute("href");
      if (
        !raw ||
        raw.startsWith("#") ||
        raw.startsWith("mailto:") ||
        raw.startsWith("tel:")
      ) {
        return;
      }

      const next = new URL(raw, window.location.href);
      if (next.origin !== window.location.origin) {
        return;
      }

      if (
        next.pathname === window.location.pathname &&
        next.search === window.location.search
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      requestLeave(`${next.pathname}${next.search}${next.hash}`);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty, requestLeave]);

  function keepEditing() {
    setOpen(false);
    setHref(null);
  }

  function discard() {
    const next = href;
    setOpen(false);
    setHref(null);
    if (next) {
      router.push(next);
    }
  }

  return { open, requestLeave, keepEditing, discard };
}
