import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createNoopSessionEventPublisher,
  getSessionEventPublisher,
  type SessionRealtimeEvent,
} from "@/lib/realtime/publisher";

const SAMPLE_EVENT: SessionRealtimeEvent = {
  type: "stage.changed",
  sessionId: "session_1",
  displayToken: "display_token_1",
  currentStageTemplateId: "stage_2",
  direction: "NEXT",
  occurredAt: "2026-04-17T10:00:00.000Z",
};

afterEach(() => {
  const globalWithPublisher = globalThis as typeof globalThis & {
    sessionEventPublisher?: unknown;
  };
  delete globalWithPublisher.sessionEventPublisher;
  vi.restoreAllMocks();
});

describe("createNoopSessionEventPublisher", () => {
  it("resolves without error for a valid event", async () => {
    const publisher = createNoopSessionEventPublisher();

    await expect(publisher.publish(SAMPLE_EVENT)).resolves.toBeUndefined();
  });
});

describe("getSessionEventPublisher", () => {
  it("returns the same singleton across calls", () => {
    const first = getSessionEventPublisher();
    const second = getSessionEventPublisher();

    expect(first).toBe(second);
  });

  it("defaults to a no-op publisher when no override is registered", async () => {
    const publisher = getSessionEventPublisher();

    await expect(publisher.publish(SAMPLE_EVENT)).resolves.toBeUndefined();
  });
});
