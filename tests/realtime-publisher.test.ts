import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createNoopSessionEventPublisher,
  createSupabaseSessionEventPublisher,
  getSessionEventPublisher,
  type SessionRealtimeEvent,
} from "@/lib/realtime/publisher";

const SAMPLE_STAGE_EVENT: SessionRealtimeEvent = {
  type: "stage.changed",
  sessionId: "session_1",
  displayToken: "display_token_1",
  currentStageTemplateId: "stage_2",
  direction: "NEXT",
  occurredAt: "2026-04-17T10:00:00.000Z",
};

const SAMPLE_COMPLETION_EVENT: SessionRealtimeEvent = {
  type: "session.completed",
  sessionId: "session_1",
  displayToken: "display_token_1",
  occurredAt: "2026-04-18T11:30:00.000Z",
};

const SUPABASE_URL = "https://example.supabase.co";
const SUPABASE_KEY = "service_role_key_stub";

afterEach(() => {
  const globalWithPublisher = globalThis as typeof globalThis & {
    sessionEventPublisher?: unknown;
  };
  delete globalWithPublisher.sessionEventPublisher;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  vi.restoreAllMocks();
});

describe("createNoopSessionEventPublisher", () => {
  it("resolves without error for a valid event", async () => {
    const publisher = createNoopSessionEventPublisher();

    await expect(
      publisher.publish(SAMPLE_STAGE_EVENT)
    ).resolves.toBeUndefined();
  });
});

describe("createSupabaseSessionEventPublisher", () => {
  it("POSTs exactly one nudge message with display-scoped topic and scrubbed payload", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 202 }));

    const publisher = createSupabaseSessionEventPublisher({
      url: SUPABASE_URL,
      serviceRoleKey: SUPABASE_KEY,
      fetchImpl,
    });

    await publisher.publish(SAMPLE_STAGE_EVENT);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${SUPABASE_URL}/realtime/v1/api/broadcast`);
    expect(init?.method).toBe("POST");
    const headers = init?.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers.apikey).toBe(SUPABASE_KEY);
    expect(headers.Authorization).toBe(`Bearer ${SUPABASE_KEY}`);

    const body = JSON.parse(init?.body as string) as {
      messages: Array<{
        topic: string;
        event: string;
        payload: Record<string, unknown>;
        private: boolean;
      }>;
    };
    expect(body.messages).toHaveLength(1);
    const [message] = body.messages;
    expect(message.topic).toBe(`display:${SAMPLE_STAGE_EVENT.displayToken}`);
    expect(message.event).toBe("stage.changed");
    expect(message.private).toBe(false);
    expect(message.payload).toEqual({
      type: "stage.changed",
      occurredAt: SAMPLE_STAGE_EVENT.occurredAt,
    });
  });

  it("never forwards staff-only fields (sessionId, currentStageTemplateId, direction, displayToken) into the payload", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 202 }));

    const publisher = createSupabaseSessionEventPublisher({
      url: SUPABASE_URL,
      serviceRoleKey: SUPABASE_KEY,
      fetchImpl,
    });

    await publisher.publish(SAMPLE_STAGE_EVENT);

    const [, init] = fetchImpl.mock.calls[0];
    const body = init?.body as string;
    const parsed = JSON.parse(body) as {
      messages: Array<{ payload: Record<string, unknown> }>;
    };
    const payload = parsed.messages[0].payload;

    expect(payload).not.toHaveProperty("sessionId");
    expect(payload).not.toHaveProperty("currentStageTemplateId");
    expect(payload).not.toHaveProperty("direction");
    expect(payload).not.toHaveProperty("displayToken");
    expect(Object.keys(payload).sort()).toEqual(["occurredAt", "type"]);
  });

  it("strips a trailing slash on the base url so the endpoint is well-formed", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 202 }));

    const publisher = createSupabaseSessionEventPublisher({
      url: `${SUPABASE_URL}/`,
      serviceRoleKey: SUPABASE_KEY,
      fetchImpl,
    });

    await publisher.publish(SAMPLE_STAGE_EVENT);

    const [url] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${SUPABASE_URL}/realtime/v1/api/broadcast`);
  });

  it("swallows transport errors so stage-transition orchestration is unaffected", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network partition"));

    const publisher = createSupabaseSessionEventPublisher({
      url: SUPABASE_URL,
      serviceRoleKey: SUPABASE_KEY,
      fetchImpl,
    });

    await expect(
      publisher.publish(SAMPLE_STAGE_EVENT)
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });

  it("swallows non-2xx responses with a warn log", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 500, statusText: "Internal Server Error" })
      );

    const publisher = createSupabaseSessionEventPublisher({
      url: SUPABASE_URL,
      serviceRoleKey: SUPABASE_KEY,
      fetchImpl,
    });

    await expect(
      publisher.publish(SAMPLE_STAGE_EVENT)
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });

  it("uses a distinct additive event name for completion nudges", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 202 }));

    const publisher = createSupabaseSessionEventPublisher({
      url: SUPABASE_URL,
      serviceRoleKey: SUPABASE_KEY,
      fetchImpl,
    });

    await publisher.publish(SAMPLE_COMPLETION_EVENT);

    const [, init] = fetchImpl.mock.calls[0];
    const body = JSON.parse(init?.body as string) as {
      messages: Array<{
        topic: string;
        event: string;
        payload: Record<string, unknown>;
        private: boolean;
      }>;
    };

    expect(body.messages[0]).toEqual({
      topic: `display:${SAMPLE_COMPLETION_EVENT.displayToken}`,
      event: "session.completed",
      private: false,
      payload: {
        type: "session.completed",
        occurredAt: SAMPLE_COMPLETION_EVENT.occurredAt,
      },
    });
  });
});

describe("getSessionEventPublisher", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns the same singleton across calls", () => {
    const first = getSessionEventPublisher();
    const second = getSessionEventPublisher();

    expect(first).toBe(second);
  });

  it("falls back to a no-op publisher when Supabase env is missing", async () => {
    const publisher = getSessionEventPublisher();

    await expect(
      publisher.publish(SAMPLE_STAGE_EVENT)
    ).resolves.toBeUndefined();
  });

  it("returns a Supabase-backed publisher when env is configured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = SUPABASE_KEY;
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 202 }));

    const publisher = getSessionEventPublisher();
    await publisher.publish(SAMPLE_STAGE_EVENT);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe(
      `${SUPABASE_URL}/realtime/v1/api/broadcast`
    );
  });
});
