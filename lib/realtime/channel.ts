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
 * The only event name we broadcast on a display channel today. Future
 * patient-visible event types must extend this union additively and get
 * their own nudge shape in `DisplayNudge` rather than overloading this
 * name.
 */
export const DISPLAY_NUDGE_EVENT_NAME = "stage.changed" as const;

/**
 * Strictly the two fields that may leave the server for the patient
 * channel. `occurredAt` is useful only as a freshness signal; everything
 * authoritative is re-read from the database.
 */
export interface DisplayNudge {
  type: typeof DISPLAY_NUDGE_EVENT_NAME;
  occurredAt: string;
}

export function displayChannelName(displayToken: string): string {
  return `${DISPLAY_CHANNEL_PREFIX}${displayToken}`;
}
