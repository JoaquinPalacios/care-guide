import type { ReactNode } from "react";

import { LogoutButton } from "@/app/dashboard/logout-button";
import { requireStaffSession } from "@/lib/auth/require-staff-session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { user, clinicMembership } = await requireStaffSession();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-zinc-500">
              Care Guide
            </p>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-zinc-950">
                Staff dashboard
              </p>
              <p className="text-sm text-zinc-600">
                Signed in as {user.email}
                {clinicMembership
                  ? ` for ${clinicMembership.clinic.name}.`
                  : "."}
              </p>
            </div>
          </div>

          <LogoutButton />
        </div>
      </header>

      <div className="flex-1 px-6 py-12">{children}</div>
    </div>
  );
}
