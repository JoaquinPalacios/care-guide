import "server-only";

/**
 * Minimal session-scoped realtime events surfaced by the stage-transition
 * service. Only `stage.changed` exists in Issue #11 and is intentionally a
 * "nudge" payload: the patient display must continue to treat the database
 * as the source of truth and re-load from the display token when signalled.
 *
 * New event variants must be additive so future issues (e.g. mode changes,
 * completion) can extend the union without breaking existing subscribers.
 */
export type SessionRealtimeEvent = {
  type: "stage.changed";
  sessionId: string;
  displayToken: string;
  currentStageTemplateId: string;
  direction: "NEXT" | "PREVIOUS";
  occurredAt: string;
};

export interface SessionEventPublisher {
  publish(event: SessionRealtimeEvent): Promise<void>;
}

/**
 * Default publisher implementation for Issue #11. It performs no network
 * work — the real transport (Supabase Realtime) is wired by a later issue.
 * Keeping this as a deliberate no-op lets the stage-transition service ship
 * its publish-after-commit orchestration behind a narrow interface that can
 * be swapped for a live provider without touching business logic.
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

const globalForPublisher = globalThis as typeof globalThis & {
  sessionEventPublisher?: SessionEventPublisher;
};

/**
 * Lazily-initialized process-wide publisher. The singleton keeps stage
 * transitions fast by avoiding per-call allocation and gives Issue #12/#13
 * a single seam to swap the no-op for a Supabase-backed implementation.
 */
export function getSessionEventPublisher(): SessionEventPublisher {
  if (!globalForPublisher.sessionEventPublisher) {
    globalForPublisher.sessionEventPublisher =
      createNoopSessionEventPublisher();
  }
  return globalForPublisher.sessionEventPublisher;
}
