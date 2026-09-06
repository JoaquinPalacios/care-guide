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
        themeMode: "SYSTEM",
        allowPatientThemeToggle: false,
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
    expect(html).toContain("aftercareTheme");
    expect(html).toContain("html{color-scheme:light dark}");
    expect(html).toContain("light-dark(");
    expect(html).toContain("child");
    expect(html).not.toContain("ThemeProvider");
    expect(html).not.toContain("Colour theme");
  });

  it.each([
    ["LIGHT", "light"],
    ["DARK", "dark"],
    ["SYSTEM", "light dark"],
  ] as const)("honours clinic theme mode %s", async (themeMode, scheme) => {
    requireTenantClinic.mockResolvedValue({
      id: "clinic_b",
      slug: "otherclinic",
      name: "Other Clinic",
      profile: {
        displayName: "Other Clinic Patient Brand",
        primaryColor: "#7c3aed",
        accentColor: "#db2777",
        themeMode,
        allowPatientThemeToggle: false,
      },
    });

    const html = renderToStaticMarkup(
      await TenantLayout({
        params: Promise.resolve({ tenant: "otherclinic" }),
        children: <p>child</p>,
      })
    );

    expect(html).toContain(`html{color-scheme:${scheme}}`);
    expect(html).not.toContain("Colour theme");
  });

  it("renders the patient theme control only when the clinic allows it", async () => {
    requireTenantClinic.mockResolvedValue({
      id: "clinic_demo_rivers",
      slug: "demodental",
      name: "Rivers Care Demo Clinic",
      profile: {
        displayName: "Riverside Dental Demo",
        primaryColor: "#0f766e",
        accentColor: "#f59e0b",
        themeMode: "SYSTEM",
        allowPatientThemeToggle: true,
      },
    });

    const html = renderToStaticMarkup(
      await TenantLayout({
        params: Promise.resolve({ tenant: "demodental" }),
        children: <p>child</p>,
      })
    );

    expect(html).toContain("Colour theme");
    expect(html).toContain("patient-theme");
    expect(html).toContain("localStorage.getItem");
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
