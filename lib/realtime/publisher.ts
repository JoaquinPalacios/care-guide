import "server-only";

import {
  DISPLAY_SESSION_COMPLETED_EVENT_NAME,
  DISPLAY_STAGE_CHANGED_EVENT_NAME,
  displayChannelName,
  type DisplayNudge,
} from "@/lib/realtime/channel";

/**
 * Minimal session-scoped realtime events surfaced by patient-visible
 * services. These remain intentionally "nudge" signals: the patient display
 * must continue to treat the database as the source of truth and re-load
 * from the display token when signalled.
 *
 * NOTE: this type describes the server-internal event that the publisher
 * *receives*. It is deliberately richer than the payload that leaves the
 * trust boundary. The transport layer scrubs everything down to
 * `DisplayNudge` before broadcasting to patient clients so staff-only
 * fields (`sessionId`, `currentStageTemplateId`, `direction`, and the
 * `displayToken` itself) never leak into client subscription payloads.
 */
export type SessionRealtimeEvent =
  | {
      type: "stage.changed";
      sessionId: string;
      displayToken: string;
      currentStageTemplateId: string;
      direction: "NEXT" | "PREVIOUS";
      occurredAt: string;
    }
  | {
      type: "session.completed";
      sessionId: string;
      displayToken: string;
      occurredAt: string;
    };

export interface SessionEventPublisher {
  publish(event: SessionRealtimeEvent): Promise<void>;
}

/**
 * No-op publisher. Used (a) in local dev and tests when Supabase env is
 * not configured, and (b) as the default seam so stage transitions keep
 * working even if realtime is intentionally disabled. Swallowing the
 * event here is the correct behavior — the database remains the source
 * of truth and refreshing the patient display still shows current state.
 */
export function createNoopSessionEventPublisher(): SessionEventPublisher {
  return {
    async publish(event) {
      if (process.env.NODE_ENV !== "production") {
        console.debug("[realtime:noop] publish", event);
      }
    },
  };
}

export interface SupabasePublisherConfig {
  url: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
}

/**
 * Supabase Realtime broadcast publisher. Uses the HTTP broadcast API
 * (`POST /realtime/v1/api/broadcast`) rather than a websocket channel so
 * a stateless server action can fire and forget without paying the
 * WS handshake cost on every stage transition.
 *
 * The transport layer is the last place `SessionRealtimeEvent` exists in
 * full: before the message leaves this function it is scrubbed down to
 * the strictly nudge-shaped `DisplayNudge`. `sessionId`,
 * `currentStageTemplateId`, `direction`, and the `displayToken` itself
 * are never forwarded to the client — the patient client refreshes
 * canonical server data via `loadPatientDisplay(token)` on receipt.
 *
 * Failures (network, non-2xx, serialization) are swallowed with a warn
 * log. The DB write has already committed by the time we publish, and
 * a missed nudge only means the patient display will not update live
 * for that transition — refresh still reflects the persisted state.
 */
export function createSupabaseSessionEventPublisher(
  config: SupabasePublisherConfig
): SessionEventPublisher {
  const fetchImpl = config.fetchImpl ?? fetch;
  const endpoint = `${stripTrailingSlash(config.url)}/realtime/v1/api/broadcast`;

  return {
    async publish(event) {
      const nudge: DisplayNudge = {
        type:
          event.type === "session.completed"
            ? DISPLAY_SESSION_COMPLETED_EVENT_NAME
            : DISPLAY_STAGE_CHANGED_EVENT_NAME,
        occurredAt: event.occurredAt,
      };

      try {
        const response = await fetchImpl(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: config.serviceRoleKey,
            Authorization: `Bearer ${config.serviceRoleKey}`,
          },
          body: JSON.stringify({
            messages: [
              {
                topic: displayChannelName(event.displayToken),
                event: nudge.type,
                payload: nudge,
                private: false,
              },
            ],
          }),
        });

        if (!response.ok) {
          console.warn("[realtime:supabase] broadcast non-ok response", {
            status: response.status,
            statusText: response.statusText,
          });
        }
      } catch (error) {
        console.warn("[realtime:supabase] broadcast failed", { error });
      }
    },
  };
}

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function resolveSupabaseServerConfig(): SupabasePublisherConfig | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? null;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

const globalForPublisher = globalThis as typeof globalThis & {
  sessionEventPublisher?: SessionEventPublisher;
};

/**
 * Lazily-initialized process-wide publisher. The singleton keeps stage
 * transitions fast by avoiding per-call allocation and gives the service
 * layer a single seam it knows about.
 *
 * When Supabase env is configured the Supabase transport is returned;
 * otherwise the no-op is returned. This keeps local dev, CI, and any
 * environment that intentionally omits realtime fully functional — the
 * database is still the source of truth on refresh.
 */
export function getSessionEventPublisher(): SessionEventPublisher {
  if (!globalForPublisher.sessionEventPublisher) {
    const supabaseConfig = resolveSupabaseServerConfig();
    globalForPublisher.sessionEventPublisher = supabaseConfig
      ? createSupabaseSessionEventPublisher(supabaseConfig)
      : createNoopSessionEventPublisher();
  }
  return globalForPublisher.sessionEventPublisher;
}
