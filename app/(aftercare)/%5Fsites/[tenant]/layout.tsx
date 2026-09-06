import {
  AFTERCARE_THEME_SCOPE,
  resolveAftercareTheme,
  serializeAftercareThemeCss,
} from "@/lib/branding/aftercare-theme";
import {
  PATIENT_THEME_STORAGE_KEY,
  themePreferenceBootstrapScript,
} from "@/lib/branding/theme-preference";
import { requireTenantClinic } from "@/lib/tenancy/require-tenant-clinic";

import type { ReactNode } from "react";

interface TenantLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}

export const dynamic = "force-dynamic";

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { tenant } = await params;
  const clinic = await requireTenantClinic(tenant);
  const theme = resolveAftercareTheme(clinic.profile);
  const allowPatientThemeToggle =
    clinic.profile?.allowPatientThemeToggle === true;
  const ThemeControl = allowPatientThemeToggle
    ? (await import("@/app/(aftercare)/components/patient-theme-control"))
        .PatientThemeControl
    : null;

  return (
    <>
      {allowPatientThemeToggle ? (
        <script
          dangerouslySetInnerHTML={{
            __html: themePreferenceBootstrapScript(PATIENT_THEME_STORAGE_KEY),
          }}
        />
      ) : null}
      <style
        dangerouslySetInnerHTML={{
          __html: serializeAftercareThemeCss(theme, {
            themeMode: clinic.profile?.themeMode,
          }),
        }}
      />
      <div className={AFTERCARE_THEME_SCOPE}>
        {ThemeControl ? (
          <div className="patientThemeSlot">
            <ThemeControl />
          </div>
        ) : null}
        {children}
      </div>
    </>
  );
}
