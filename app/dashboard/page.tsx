import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Protected dashboard landing page for Care Guide staff.",
};

export default function DashboardPage() {
  return (
    <section className="mx-auto w-full max-w-3xl">
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
    </section>
  );
}
