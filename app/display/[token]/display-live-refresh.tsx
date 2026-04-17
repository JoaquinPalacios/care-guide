"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { subscribeToDisplayChannel } from "@/lib/realtime/subscriber";

interface DisplayLiveRefreshProps {
  token: string;
}

/**
 * Patient-side live updater. Subscribes to the display-scoped realtime
 * channel and asks the App Router to refresh the current route whenever
 * a `stage.changed` nudge arrives. Intentionally renders nothing.
 *
 * Canonical server data is re-read by `loadPatientDisplay(token)` in
 * the page's Server Component on refresh — the broadcast payload is
 * never trusted as the source of truth. If realtime is unavailable the
 * subscription is a no-op and manual refresh still works.
 */
export function DisplayLiveRefresh({ token }: DisplayLiveRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeToDisplayChannel({
      displayToken: token,
      onStageChanged: () => {
        router.refresh();
      },
    });
    return unsubscribe;
  }, [token, router]);

  return null;
}
