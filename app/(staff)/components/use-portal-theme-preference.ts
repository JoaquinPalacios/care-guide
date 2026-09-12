"use client";

import { useEffect, useState } from "react";

import {
  readPortalThemePreference,
  type ThemePreference,
} from "@/lib/branding/theme-preference";

export function usePortalThemePreference(): ThemePreference {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const sync = () => setPreference(readPortalThemePreference());
    sync();
    window.addEventListener("storage", sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme-mode"],
    });
    return () => {
      window.removeEventListener("storage", sync);
      observer.disconnect();
    };
  }, []);

  return preference;
}
