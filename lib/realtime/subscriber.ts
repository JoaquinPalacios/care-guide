import { createClient } from "@supabase/supabase-js";

import {
  DISPLAY_NUDGE_EVENT_NAME,
  displayChannelName,
} from "@/lib/realtime/channel";

/**
 * Minimal surface we need from a Supabase-like realtime client. Defined
 * structurally so tests can pass a hand-built fake without pulling in
 * `@supabase/supabase-js` types and so the subscriber stays decoupled
 * from the concrete SDK shape.
 */
export interface DisplaySubscriptionChannel {
  on(
    type: "broadcast",
    filter: { event: string },
    handler: () => void
  ): DisplaySubscriptionChannel;
  subscribe(): DisplaySubscriptionChannel;
}

export interface DisplaySubscriptionClient {
  channel(name: string): DisplaySubscriptionChannel;
  removeChannel(channel: DisplaySubscriptionChannel): void;
}

export interface SubscribeToDisplayChannelOptions {
  displayToken: string;
  onStageChanged: () => void;
  /**
   * Optional client override. When omitted, the subscriber tries to
   * build a default Supabase browser client from the public env vars.
   * If that fails (missing env, malformed input), the returned
   * unsubscribe is a synchronous no-op and nothing is logged.
   */
  client?: DisplaySubscriptionClient | null;
}

/**
 * Subscribe to the patient display channel for `displayToken` and invoke
 * `onStageChanged` every time a `stage.changed` broadcast arrives.
 *
 * By construction this only registers a handler for the single
 * `DISPLAY_NUDGE_EVENT_NAME` event on the display-scoped channel.
 * Broadcasts with any other event name, or broadcasts on any other
 * channel, cannot reach the callback.
 *
 * Returns an unsubscribe function that removes the channel. The
 * function is always safe to call, including in the fallback path where
 * no client was resolved.
 */
export function subscribeToDisplayChannel(
  options: SubscribeToDisplayChannelOptions
): () => void {
  const { displayToken, onStageChanged } = options;

  if (typeof displayToken !== "string" || displayToken.length === 0) {
    return () => {};
  }

  const client = options.client ?? resolveDefaultDisplaySubscriptionClient();

  if (!client) {
    return () => {};
  }

  const channel = client
    .channel(displayChannelName(displayToken))
    .on("broadcast", { event: DISPLAY_NUDGE_EVENT_NAME }, () => {
      onStageChanged();
    })
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

/**
 * Build a patient-safe Supabase browser client from the public env vars.
 * Returns `null` if the env is missing — callers treat that as "realtime
 * unavailable" and fall back to static rendering plus manual refresh.
 *
 * Only uses `NEXT_PUBLIC_*` variables on purpose; the service role key
 * must never be bundled into client JavaScript.
 */
function resolveDefaultDisplaySubscriptionClient(): DisplaySubscriptionClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    return null;
  }

  return createClient(
    url,
    publishableKey
  ) as unknown as DisplaySubscriptionClient;
}
