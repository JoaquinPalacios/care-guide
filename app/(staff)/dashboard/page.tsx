import { ProcedureSessionStatus } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";

import { requireStaffSession } from "@/lib/auth/require-staff-session";
import {
  type InProgressSessionListItem,
  listInProgressSessions,
} from "@/lib/sessions/list-in-progress-sessions";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Protected dashboard landing page for Care Guide staff.",
};

export default async function DashboardPage() {
  const { clinicMembership } = await requireStaffSession();
  const clinic = clinicMembership!.clinic;

  const inProgressSessions = await listInProgressSessions(clinic.id);

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          Dashboard
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          You are in the protected staff shell. This dashboard stays
          intentionally minimal for now and serves as the placeholder landing
          page for later internal features.
        </p>
        <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm leading-6 text-zinc-700">
          Internal staff pages can now reuse this server-side protection pattern
          instead of reimplementing auth checks per page.
        </div>
        <p className="mt-6 text-sm leading-6 text-zinc-600">
          <Link
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
            href="/dashboard/procedures"
          >
            View procedure templates (read-only)
          </Link>
        </p>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          <Link
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
            href="/sessions/new"
          >
            Start a new session
          </Link>
        </p>
      </div>

      <InProgressSessionsCard sessions={inProgressSessions} />
    </section>
  );
}

function InProgressSessionsCard({
  sessions,
}: {
  sessions: InProgressSessionListItem[];
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
          In-progress sessions
        </h2>
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
          {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        Sessions in DRAFT or ACTIVE status currently occupy a room and block new
        sessions for that room. Open one to complete it from the control screen.
      </p>

      {sessions.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-4 text-sm leading-6 text-zinc-600">
          No in-progress sessions. All rooms are free.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200">
          {sessions.map((session) => (
            <li key={session.id}>
              <InProgressSessionRow session={session} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InProgressSessionRow({
  session,
}: {
  session: InProgressSessionListItem;
}) {
  return (
    <Link
      href={`/session/${session.id}/control`}
      className="flex flex-col gap-1 px-4 py-4 text-sm leading-6 transition hover:bg-zinc-50"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-zinc-950">{session.roomName}</span>
        <StatusBadge status={session.status} />
      </div>
      <p className="text-zinc-700">
        {session.procedureTemplateName}
        {session.selectedAreaLabel ? ` — ${session.selectedAreaLabel}` : ""}
      </p>
      <p className="text-xs text-zinc-500">
        {session.doctorName} &middot; created{" "}
        {formatCreatedAt(session.createdAt)}
      </p>
    </Link>
  );
}

function StatusBadge({ status }: { status: ProcedureSessionStatus }) {
  const isActive = status === ProcedureSessionStatus.ACTIVE;
  const className = isActive
    ? "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
    : "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800";

  return <span className={className}>{status}</span>;
}

function formatCreatedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
