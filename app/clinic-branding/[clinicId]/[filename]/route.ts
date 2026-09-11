import { NextResponse } from "next/server";

import {
  CLINIC_LOGO_RESPONSE_HEADERS,
  readClinicLogoObject,
} from "@/lib/clinic-assets/read-clinic-logo";

export async function GET(
  _request: Request,
  context: { params: Promise<{ clinicId: string; filename: string }> }
) {
  const { clinicId, filename } = await context.params;
  const stored = await readClinicLogoObject({ clinicId, filename });
  if (!stored) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(Buffer.from(stored.bytes), {
    status: 200,
    headers: {
      "Content-Type":
        stored.mimeType === "image/svg+xml"
          ? "image/svg+xml; charset=utf-8"
          : stored.mimeType,
      ...CLINIC_LOGO_RESPONSE_HEADERS,
    },
  });
}
