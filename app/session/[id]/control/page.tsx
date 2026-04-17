import { ProcedureSessionStatus } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CompleteSessionButton } from "@/app/session/[id]/control/complete-session-button";
import { requireStaffSession } from "@/lib/auth/require-staff-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Session control",
  description:
    "Placeholder landing page for the session control surface. Real controls ship in a later issue.",
};

interface ControlPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionControlPlaceholderPage({
  params,
}: ControlPageProps) {
  const { id } = await params;
  const { clinicMembership } = await requireStaffSession();
  const clinic = clinicMembership!.clinic;

  const session = await prisma.procedureSession.findFirst({
    where: { id, clinicId: clinic.id },
    select: { id: true, status: true },
  });

  if (!session) {
    notFound();
  }

  return (
    <main className="flex flex-1 justify-center bg-zinc-50 px-6 py-12">
      <section className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-zinc-500">
          Session control
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          Control UI coming soon
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          This session was created successfully and is in status
          <span className="mx-1 rounded-sm bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-700">
            {session.status}
          </span>
          . The real stage controls will be delivered in a later issue.
        </p>
        {session.status !== ProcedureSessionStatus.COMPLETED ? (
          <div className="mt-6">
            <CompleteSessionButton sessionId={session.id} />
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Marks this session as completed and unblocks the room so a new
              session can start.
            </p>
          </div>
        ) : null}
        <p className="mt-6 text-sm leading-6 text-zinc-600">
          <Link
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
            href="/dashboard"
          >
            Back to dashboard
          </Link>
        </p>
      </section>
    </main>
  );
}
