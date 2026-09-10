import type { ReactNode } from "react";

import { requireStaffSession } from "@/lib/auth/require-staff-session";

import "@/app/(aftercare)/aftercare.css";

export default async function GuidePreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireStaffSession();
  return children;
}
