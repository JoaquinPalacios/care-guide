import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const { requireTenantClinic } = vi.hoisted(() => ({
  requireTenantClinic: vi.fn(),
}));

vi.mock("@/lib/tenancy/require-tenant-clinic", () => ({
  requireTenantClinic,
}));

import TenantLayout from "@/app/(aftercare)/%5Fsites/[tenant]/layout";

describe("tenant layout branding", () => {
  beforeEach(() => {
    requireTenantClinic.mockReset();
  });

  it("applies server-rendered semantic tokens for the clinic", async () => {
    requireTenantClinic.mockResolvedValue({
      id: "clinic_demo_rivers",
      slug: "demodental",
      name: "Rivers Care Demo Clinic",
      profile: {
        displayName: "Riverside Dental Demo",
        primaryColor: "#0f766e",
        accentColor: "#f59e0b",
      },
    });

    const html = renderToStaticMarkup(
      await TenantLayout({
        params: Promise.resolve({ tenant: "demodental" }),
        children: <p>child</p>,
      })
    );

    expect(html).toContain("--cg-brand:#0f766e");
    expect(html).toContain("--cg-accent:#f59e0b");
    expect(html).toContain("--cg-on-brand:#ffffff");
    expect(html).toContain("child");
    expect(html).not.toContain("ThemeProvider");
  });

  it("does not apply tenant A colours when rendering tenant B", async () => {
    requireTenantClinic.mockResolvedValue({
      id: "clinic_b",
      slug: "otherclinic",
      name: "Other Clinic",
      profile: {
        displayName: "Other Clinic Patient Brand",
        primaryColor: "#7c3aed",
        accentColor: "#db2777",
      },
    });

    const html = renderToStaticMarkup(
      await TenantLayout({
        params: Promise.resolve({ tenant: "otherclinic" }),
        children: <p>child</p>,
      })
    );

    expect(html).toContain("--cg-brand:#7c3aed");
    expect(html).not.toContain("#0f766e");
    expect(requireTenantClinic).toHaveBeenCalledWith("otherclinic");
  });
});
