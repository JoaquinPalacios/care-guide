import { NextResponse } from "next/server";

import { marketingSiteOrigin } from "@/lib/marketing/site";
import { loadPlatformSeoIdentity } from "@/lib/seo/load-platform-seo";
import { buildLlmsTxt } from "@/lib/seo/llms-txt";

export const dynamic = "force-dynamic";

export async function GET() {
  const identity = await loadPlatformSeoIdentity();
  const body = buildLlmsTxt({
    identity,
    origin: marketingSiteOrigin(),
  });

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
