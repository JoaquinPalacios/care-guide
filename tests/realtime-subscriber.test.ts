import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  DisplaySubscriptionChannel,
  DisplaySubscriptionClient,
} from "@/lib/realtime/subscriber";
import { subscribeToDisplayChannel } from "@/lib/realtime/subscriber";

const DISPLAY_TOKEN = "display_token_42";
const EXPECTED_CHANNEL = `display:${DISPLAY_TOKEN}`;

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  vi.restoreAllMocks();
});

interface FakeClient extends DisplaySubscriptionClient {
  emit(event: string): void;
  channelSpy: ReturnType<typeof vi.fn>;
  onSpy: ReturnType<typeof vi.fn>;
  subscribeSpy: ReturnType<typeof vi.fn>;
  removeChannelSpy: ReturnType<typeof vi.fn>;
}

function createFakeClient(): FakeClient {
  const handlers = new Map<string, () => void>();

  const channel: DisplaySubscriptionChannel = {
    on(_type, filter, handler) {
      handlers.set(filter.event, handler);
      return channel;
    },
    subscribe() {
      return channel;
    },
  };

  const channelSpy = vi.fn(() => channel);
  const onSpy = vi.spyOn(channel, "on");
  const subscribeSpy = vi.spyOn(channel, "subscribe");
  const removeChannelSpy = vi.fn();

  return {
    channel: channelSpy as unknown as DisplaySubscriptionClient["channel"],
    removeChannel:
      removeChannelSpy as unknown as DisplaySubscriptionClient["removeChannel"],
    emit(event: string) {
      const handler = handlers.get(event);
      handler?.();
    },
    channelSpy,
    onSpy,
    subscribeSpy,
    removeChannelSpy,
  };
}

describe("subscribeToDisplayChannel", () => {
  it("subscribes to the display-scoped channel name only", () => {
    const client = createFakeClient();

    subscribeToDisplayChannel({
      displayToken: DISPLAY_TOKEN,
      onStageChanged: () => {},
      client,
    });

    expect(client.channelSpy).toHaveBeenCalledTimes(1);
    expect(client.channelSpy).toHaveBeenCalledWith(EXPECTED_CHANNEL);
  });

  it("registers exactly one broadcast handler for the 'stage.changed' event", () => {
    const client = createFakeClient();

    subscribeToDisplayChannel({
      displayToken: DISPLAY_TOKEN,
      onStageChanged: () => {},
      client,
    });

    expect(client.onSpy).toHaveBeenCalledTimes(1);
    const [type, filter] = client.onSpy.mock.calls[0];
    expect(type).toBe("broadcast");
    expect(filter).toEqual({ event: "stage.changed" });
    expect(client.subscribeSpy).toHaveBeenCalledTimes(1);
  });

  it("invokes onStageChanged when the matching event fires", () => {
    const client = createFakeClient();
    const onStageChanged = vi.fn();

    subscribeToDisplayChannel({
      displayToken: DISPLAY_TOKEN,
      onStageChanged,
      client,
    });

    client.emit("stage.changed");
    expect(onStageChanged).toHaveBeenCalledTimes(1);

    client.emit("stage.changed");
    expect(onStageChanged).toHaveBeenCalledTimes(2);
  });

  it("ignores non-matching broadcast events", () => {
    const client = createFakeClient();
    const onStageChanged = vi.fn();

    subscribeToDisplayChannel({
      displayToken: DISPLAY_TOKEN,
      onStageChanged,
      client,
    });

    client.emit("session.completed");
    client.emit("display.mode.changed");
    client.emit("stage.started");

    expect(onStageChanged).not.toHaveBeenCalled();
  });

  it("returns an unsubscribe that removes the channel", () => {
    const client = createFakeClient();

    const unsubscribe = subscribeToDisplayChannel({
      displayToken: DISPLAY_TOKEN,
      onStageChanged: () => {},
      client,
    });

    expect(client.removeChannelSpy).not.toHaveBeenCalled();
    unsubscribe();
    expect(client.removeChannelSpy).toHaveBeenCalledTimes(1);
  });

  it("returns a no-op unsubscribe when no client can be resolved (missing env)", () => {
    const onStageChanged = vi.fn();

    const unsubscribe = subscribeToDisplayChannel({
      displayToken: DISPLAY_TOKEN,
      onStageChanged,
      client: null,
    });

    expect(() => unsubscribe()).not.toThrow();
    expect(onStageChanged).not.toHaveBeenCalled();
  });

  it("returns a no-op unsubscribe when the display token is empty", () => {
    const client = createFakeClient();
    const onStageChanged = vi.fn();

    const unsubscribe = subscribeToDisplayChannel({
      displayToken: "",
      onStageChanged,
      client,
    });

    expect(client.channelSpy).not.toHaveBeenCalled();
    expect(() => unsubscribe()).not.toThrow();
    expect(onStageChanged).not.toHaveBeenCalled();
  });
});
