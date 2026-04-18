import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const routerRefreshMock = vi.fn();
  const useRouterMock = vi.fn(() => ({
    refresh: routerRefreshMock,
  }));
  const subscribeToDisplayChannelMock = vi.fn();

  return {
    routerRefreshMock,
    useRouterMock,
    subscribeToDisplayChannelMock,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: mocks.useRouterMock,
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useEffect: (effect: () => void | (() => void)) => {
      effect();
    },
  };
});

vi.mock("@/lib/realtime/subscriber", () => ({
  subscribeToDisplayChannel: mocks.subscribeToDisplayChannelMock,
}));

import { DisplayLiveRefresh } from "@/app/display/[token]/display-live-refresh";

describe("DisplayLiveRefresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.subscribeToDisplayChannelMock.mockReturnValue(() => {});
  });

  it("requests a router refresh when a stage change nudge arrives", () => {
    DisplayLiveRefresh({ token: "display_token_42" });

    expect(mocks.subscribeToDisplayChannelMock).toHaveBeenCalledWith({
      displayToken: "display_token_42",
      onStageChanged: expect.any(Function),
    });

    const subscription = mocks.subscribeToDisplayChannelMock.mock
      .calls[0]?.[0] as { onStageChanged: () => void } | undefined;

    subscription?.onStageChanged();

    expect(mocks.routerRefreshMock).toHaveBeenCalledTimes(1);
  });
});
