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

  const {
    procedureName,
    selectedAreaLabel,
    progress,
    currentStage,
    nextStage,
  } = result;
  const progressPercent = Math.round((progress.current / progress.total) * 100);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-10 sm:px-8 sm:py-16">
      <DisplayLiveRefresh token={token} />
      <article className="w-full max-w-5xl rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <section className="min-w-0 flex-1">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
              {procedureName}
            </p>
            {selectedAreaLabel ? (
              <p className="mt-2 text-base font-medium text-zinc-700 sm:text-lg">
                {selectedAreaLabel}
              </p>
            ) : null}

            <div className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
                  {progress.label}
                </p>
                <p className="text-sm font-medium text-zinc-500">
                  {progressPercent}%
                </p>
              </div>
              <div
                aria-hidden="true"
                className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-200"
              >
                <div
                  className="h-full rounded-full bg-zinc-700 transition-[width] duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-10 rounded-[1.75rem] bg-zinc-50 p-8 sm:p-10">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
                Current step
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
                {currentStage.title}
              </h1>
              <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-zinc-700 sm:text-xl">
                {currentStage.copy}
              </p>
            </div>
          </section>

          <aside className="w-full max-w-xl lg:w-[24rem] lg:flex-none">
            <section className="rounded-[1.75rem] border border-zinc-200 bg-zinc-50/70 p-6 sm:p-8">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
                {nextStage ? "Coming up next" : "You are on the final step"}
              </p>
              {nextStage ? (
                <>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                    {nextStage.title}
                  </h2>
                  <p className="mt-4 whitespace-pre-line text-base leading-7 text-zinc-600 sm:text-lg">
                    {nextStage.copy}
                  </p>
                </>
              ) : (
                <p className="mt-4 text-base leading-7 text-zinc-600 sm:text-lg">
                  Your care team will stay with you through this final part and
                  guide you through anything that comes next.
                </p>
              )}
            </section>

            {currentStage.illustrationUrl ? (
              <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-zinc-100 bg-white">
                {/*
                  Plain <img> by design for Issue #10. Switching to next/image
                  would pull `images.remotePatterns` configuration into scope
                  before illustration hosting is decided.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentStage.illustrationUrl}
                  alt={currentStage.title}
                  className="h-auto w-full"
                />
              </div>
            ) : null}
          </aside>
        </div>
      </article>
    </main>
  );
}

function UnavailableScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-10 sm:px-8 sm:py-16">
      <section className="w-full max-w-xl rounded-4xl border border-zinc-200 bg-white p-10 text-center shadow-sm sm:p-12">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
          Patient display
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          This display is not available right now.
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600 sm:text-lg">
          Please ask a member of the care team for help when you are ready.
        </p>
      </section>
    </main>
  );
}
