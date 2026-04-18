/**
 * Shared contract between the server-side realtime publisher and the
 * patient-side subscriber. Both sides agree on (a) the channel name
 * keyed by `displayToken` and (b) the strictly nudge-shaped broadcast
 * payload that crosses the trust boundary.
 *
 * Staff-only fields (`sessionId`, `currentStageTemplateId`, `direction`,
 * the `displayToken` itself) are NEVER part of the broadcast payload —
 * the patient client refreshes canonical server data on receipt.
 */

const DISPLAY_CHANNEL_PREFIX = "display:";

/**
 * Display-channel events must remain additive. Each patient-visible nudge
 * gets its own event name so clients can opt into the smallest set they
 * need without overloading `stage.changed`.
 */
export const DISPLAY_STAGE_CHANGED_EVENT_NAME = "stage.changed" as const;
export const DISPLAY_SESSION_COMPLETED_EVENT_NAME =
  "session.completed" as const;

/**
 * Strictly the two fields that may leave the server for the patient
 * channel. `occurredAt` is useful only as a freshness signal; everything
 * authoritative is re-read from the database.
 */
export interface DisplayNudge {
  type:
    | typeof DISPLAY_STAGE_CHANGED_EVENT_NAME
    | typeof DISPLAY_SESSION_COMPLETED_EVENT_NAME;
  occurredAt: string;
}

export function displayChannelName(displayToken: string): string {
  return `${DISPLAY_CHANNEL_PREFIX}${displayToken}`;
}
