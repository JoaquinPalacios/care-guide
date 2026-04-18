import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const loadPatientDisplayMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/sessions/load-patient-display", () => ({
  loadPatientDisplay: loadPatientDisplayMock,
}));

vi.mock("@/app/display/[token]/display-live-refresh", () => ({
  DisplayLiveRefresh: () => null,
}));

import PatientDisplayPage from "@/app/display/[token]/page";

describe("PatientDisplayPage", () => {
  it("renders the generic unavailable screen for invalid or unreadable tokens", async () => {
    loadPatientDisplayMock.mockResolvedValueOnce({ kind: "unavailable" });

    const element = await PatientDisplayPage({
      params: Promise.resolve({ token: "missing-token" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("This display is not available right now.");
    expect(html).not.toContain("Your session is complete.");
  });

  it("renders a dedicated completed end state instead of the unavailable screen", async () => {
    loadPatientDisplayMock.mockResolvedValueOnce({
      kind: "completed",
      procedureName: "Routine Cleaning",
      aftercareUrl: "https://example.test/aftercare",
    });

    const element = await PatientDisplayPage({
      params: Promise.resolve({ token: "completed-token" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Your session is complete.");
    expect(html).toContain("Routine Cleaning");
    expect(html).toContain("Open aftercare instructions");
    expect(html).toContain("https://example.test/aftercare");
    expect(html).not.toContain("This display is not available right now.");
  });
});
