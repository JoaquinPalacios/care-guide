import type { Metadata } from "next";

import { DisplayLiveRefresh } from "@/app/display/[token]/display-live-refresh";
import { loadPatientDisplay } from "@/lib/sessions/load-patient-display";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Patient display",
  description: "Patient-facing procedure display. Token-scoped and read-only.",
  robots: { index: false, follow: false },
};

interface DisplayPageProps {
  params: Promise<{ token: string }>;
}

export default async function PatientDisplayPage({ params }: DisplayPageProps) {
  const { token } = await params;
  const result = await loadPatientDisplay(token);

  if (result.kind === "unavailable") {
    return <UnavailableScreen />;
  }

  const { procedureName, selectedAreaLabel, currentStage } = result;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-8 py-16">
      <DisplayLiveRefresh token={token} />
      <article className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-12 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
          {procedureName}
        </p>
        {selectedAreaLabel ? (
          <p className="mt-2 text-base font-medium text-zinc-700">
            {selectedAreaLabel}
          </p>
        ) : null}

        <h1 className="mt-8 text-5xl font-semibold tracking-tight text-zinc-950">
          {currentStage.title}
        </h1>

        <p className="mt-6 whitespace-pre-line text-xl leading-relaxed text-zinc-700">
          {currentStage.copy}
        </p>

        {currentStage.illustrationUrl ? (
          <div className="mt-10">
            {/*
              Plain <img> by design for Issue #10. Switching to next/image
              would pull `images.remotePatterns` configuration into scope
              before illustration hosting is decided.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentStage.illustrationUrl}
              alt={currentStage.title}
              className="h-auto w-full rounded-2xl border border-zinc-100"
            />
          </div>
        ) : null}
      </article>
    </main>
  );
}

function UnavailableScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-8 py-16">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          This display is not available.
        </h1>
        <p className="mt-3 text-base leading-6 text-zinc-600">
          Please ask a member of the care team for help.
        </p>
      </section>
    </main>
  );
}
