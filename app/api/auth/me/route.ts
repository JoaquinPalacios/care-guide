import { NextResponse } from "next/server";

import {
  getAuthContext,
  MultipleClinicMembershipsError,
} from "@/lib/auth/session";

export async function GET() {
  try {
    const authContext = await getAuthContext();

    if (!authContext.user) {
      return NextResponse.json(authContext, { status: 401 });
    }

    return NextResponse.json(authContext);
  } catch (error) {
    if (error instanceof MultipleClinicMembershipsError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    throw error;
  }
}
